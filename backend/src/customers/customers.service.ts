import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async createOrLookup(createCustomerDto: CreateCustomerDto, brandId: string) {
    const existing = await this.prisma.customer.findUnique({
      where: {
        brand_id_phone: { brand_id: brandId, phone: createCustomerDto.phone },
      },
    });

    if (existing) {
      return this.formatCustomer(existing);
    }

    const newCustomer = await this.prisma.customer.create({
      data: {
        brand_id: brandId,
        phone: createCustomerDto.phone,
        name: createCustomerDto.name || 'Guest',
      },
    });

    return this.formatCustomer(newCustomer);
  }

  async lookup(phone: string, brandId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        brand_id_phone: { brand_id: brandId, phone },
      },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    return this.formatCustomer(customer);
  }

  async findAll(brandId: string, search?: string, sortBy?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const whereClause: any = { brand_id: brandId };
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: whereClause,
        orderBy: { [sortBy || 'created_at']: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.customer.count({ where: whereClause }),
    ]);

    return {
      data: data.map(this.formatCustomer),
      meta: { total, page: Number(page), limit: Number(limit), total_pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, brandId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, brand_id: brandId },
      include: {
        invoices: {
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, brandId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, brand_id: brandId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    return this.prisma.customer.update({
      where: { id },
      data: { name: updateCustomerDto.name },
    });
  }

  private formatCustomer(customer: any) {
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      total_visits: customer.total_visits,
      loyalty_points: customer.loyalty_points,
    };
  }
}
