import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { generateBillingId } from './utils/billing-id.util';
import { generateInvoiceNumber } from './utils/invoice-number.util';
import { PdfService } from './pdf.service';
import { Role, InvoiceStatus, LedgerType, Customer } from '@prisma/client';
import { fromPaise, lineTaxPaise, lineTotalPaise, toPaise } from '../common/money.util';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService, private pdfService: PdfService) {}

  async create(createInvoiceDto: CreateInvoiceDto, storeId: string, employeeId: string, brandId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Gather Store & Brand info
      const store = await tx.store.findUnique({ where: { id: storeId }, include: { brand: true } });
      if (!store) throw new NotFoundException('Store not found');

      // 2. Handle Customer
      let customerId = createInvoiceDto.customer_id;
      let existingCustomer: Customer | null = null;

      if (!customerId && createInvoiceDto.customer_phone) {
        existingCustomer = await tx.customer.findUnique({
          where: { brand_id_phone: { brand_id: brandId, phone: createInvoiceDto.customer_phone } }
        });
        
        if (!existingCustomer) {
          existingCustomer = await tx.customer.create({
            data: {
              brand_id: brandId,
              phone: createInvoiceDto.customer_phone,
              name: createInvoiceDto.customer_name || 'Guest User',
            }
          });
        }
        customerId = existingCustomer.id;
      } else if (customerId) {
        existingCustomer = await tx.customer.findUnique({ where: { id: customerId } });
        if (!existingCustomer || existingCustomer.brand_id !== brandId) {
          throw new BadRequestException('Invalid customer ID');
        }
      }

      // 3. Calculate Totals (paise-based to avoid float drift)
      let subtotalPaise = 0;
      let taxAmountPaise = 0;
      
      const invoiceItemsInput = createInvoiceDto.items.map(item => {
        const itemTaxPaise = lineTaxPaise(item.quantity, item.unit_price, item.tax_rate);
        const itemTotalPaise = lineTotalPaise(item.quantity, item.unit_price, item.tax_rate);
        
        subtotalPaise += toPaise(item.quantity * item.unit_price);
        taxAmountPaise += itemTaxPaise;

        return {
          product_id: item.product_id || null,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          tax_amount: fromPaise(itemTaxPaise),
          total: fromPaise(itemTotalPaise),
        };
      });

      // 4. Loyalty points logic
      const redeemedPoints = createInvoiceDto.loyalty_points_redeemed || 0;
      let loyaltyDiscountPaise = 0;
      
      if (redeemedPoints > 0) {
        if (!existingCustomer || existingCustomer.loyalty_points < redeemedPoints) {
          throw new BadRequestException('Insufficient loyalty points');
        }
        if (redeemedPoints < store.brand.loyalty_min_redemption) {
          throw new BadRequestException(`Minimum points to redeem is ${store.brand.loyalty_min_redemption}`);
        }
        loyaltyDiscountPaise = toPaise(redeemedPoints); // 1 point = ₹1
      }

      const discountAmountPaise = toPaise(createInvoiceDto.discount_amount || 0);
      const grandTotalPaise = subtotalPaise + taxAmountPaise - discountAmountPaise - loyaltyDiscountPaise;

      if (grandTotalPaise < 0) throw new BadRequestException('Grand total cannot be negative');

      const subtotal = fromPaise(subtotalPaise);
      const taxAmount = fromPaise(taxAmountPaise);
      const discountAmount = fromPaise(discountAmountPaise);
      const loyaltyDiscount = fromPaise(loyaltyDiscountPaise);
      const grandTotal = fromPaise(grandTotalPaise);

      const earnedPoints = Math.floor(grandTotal / 100) * store.brand.loyalty_points_per_100;

      // 5. Generate Unique Billing ID (or accept offline client ID if unused)
      let billingId = createInvoiceDto.billing_id?.trim() || generateBillingId();
      let unique = false;
      while (!unique) {
        const existing = await tx.invoice.findUnique({ where: { billing_id: billingId } });
        if (!existing) unique = true;
        else {
          if (createInvoiceDto.billing_id) {
            throw new BadRequestException('billing_id already exists');
          }
          billingId = generateBillingId();
        }
      }

      // 6. Generate Invoice Number (atomic: use raw SQL for sequence safety)
      // Use a locking read on the store to prevent duplicate sequence numbers under concurrency
      await tx.$queryRaw`SELECT id FROM stores WHERE id = ${storeId}::uuid FOR UPDATE`;

      const currentYear = new Date().getFullYear();
      const seqResult = await tx.$queryRaw<{ seq: bigint }[]>`
        SELECT COUNT(*) + 1 as seq FROM invoices
        WHERE store_id = ${storeId}::uuid
        AND created_at >= ${new Date(currentYear, 0, 1)}
      `;
      const seqNumber = Number(seqResult[0]?.seq ?? 1);
      const invoiceNumber = generateInvoiceNumber(store.name, currentYear, seqNumber);

      // 7. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          brand_id: brandId,
          store_id: storeId,
          employee_id: employeeId,
          customer_id: customerId,
          billing_id: billingId,
          invoice_number: invoiceNumber,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          loyalty_points_redeemed: redeemedPoints,
          loyalty_discount: loyaltyDiscount,
          grand_total: grandTotal,
          loyalty_points_earned: earnedPoints,
          items: {
            create: invoiceItemsInput
          }
        },
        include: {
          items: true,
          customer: true,
          store: true,
        }
      });

      // 8. Update Customer & Ledger
      if (customerId && existingCustomer) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            total_visits: { increment: 1 },
            total_spend: { increment: grandTotal },
            last_visit_at: new Date(),
            loyalty_points: { increment: earnedPoints - redeemedPoints }
          }
        });

        if (redeemedPoints > 0) {
          await tx.loyaltyLedger.create({
            data: {
              customer_id: customerId,
              invoice_id: invoice.id,
              points: -redeemedPoints,
              type: LedgerType.REDEEMED,
            }
          });
        }

        if (earnedPoints > 0) {
           await tx.loyaltyLedger.create({
            data: {
              customer_id: customerId,
              invoice_id: invoice.id,
              points: earnedPoints,
              type: LedgerType.EARNED,
            }
          });
        }
      }

      // 9. Audit Log
      await tx.auditLog.create({
        data: {
          brand_id: brandId,
          user_id: employeeId,
          action: 'INVOICE_CREATED',
          target_type: 'Invoice',
          target_id: invoice.id,
        }
      });

      // 10. Auto-decrement inventory (reject insufficient stock)
      for (const item of invoiceItemsInput) {
        if (item.product_id) {
          const inv = await tx.storeInventory.findFirst({
            where: { store_id: storeId, product_id: item.product_id }
          });

          const available = inv?.quantity ?? 0;
          if (!inv || available < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for "${item.name}". Available: ${available}, requested: ${item.quantity}`,
            );
          }

          await tx.storeInventory.update({
            where: { id: inv.id },
            data: { quantity: { decrement: item.quantity } }
          });
        }
      }

      return invoice;
    });
  }

  async findAll(brandId: string, query: any, role: string, storeId?: string, employeeId?: string) {
    const { page = 1, limit = 10, date_from, date_to, status, q_store_id, q_customer_id, q_employee_id, customer_search } = query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    if (role === Role.EMPLOYEE) {
      where.employee_id = employeeId;
      where.store_id = storeId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.created_at = { gte: today };
    } else if (role === Role.STORE_ADMIN) {
      where.store_id = storeId;
    } else if (role === Role.SUPER_ADMIN) {
      where.brand_id = brandId;
      if (q_store_id) where.store_id = q_store_id;
    }

    if (date_from) where.created_at = { ...where.created_at, gte: new Date(date_from) };
    if (date_to) where.created_at = { ...where.created_at, lte: new Date(date_to) };
    if (status) where.status = status;
    if (q_customer_id) where.customer_id = q_customer_id;
    if (q_employee_id && role !== Role.EMPLOYEE) where.employee_id = q_employee_id;
    
    if (customer_search) {
      where.customer = {
        OR: [
          { name: { contains: customer_search, mode: 'insensitive' } },
          { phone: { contains: customer_search, mode: 'insensitive' } }
        ]
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: { customer: { select: { name: true } } }
      }),
      this.prisma.invoice.count({ where })
    ]);

    return {
      data: data.map(inv => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        billing_id: inv.billing_id,
        customer_name: inv.customer?.name || 'Guest User',
        grand_total: inv.grand_total,
        created_at: inv.created_at,
        status: inv.status
      })),
      meta: { total, page: Number(page), limit: Number(limit) }
    };
  }

  async findOne(id: string, role: string, userStoreId?: string, userId?: string, brandId?: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true, customer: true, store: true }
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    if (brandId && invoice.brand_id !== brandId) {
      throw new ForbiddenException('Access denied');
    }

    // Employee can only see their own invoices
    if (role === Role.EMPLOYEE && invoice.employee_id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    // Store Admin can only see invoices from their store
    if (role === Role.STORE_ADMIN && invoice.store_id !== userStoreId) {
      throw new ForbiddenException('Access denied');
    }

    return invoice;
  }

  /** Authenticated staff lookup by billing ID — includes item IDs for returns. */
  async findOneByBillingIdForStaff(
    billingId: string,
    role: string,
    brandId: string,
    userStoreId?: string,
    userId?: string,
  ) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { billing_id: billingId },
      include: { items: true, customer: true, store: true },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.brand_id !== brandId) throw new ForbiddenException('Access denied');

    if (role === Role.EMPLOYEE) {
      if (invoice.store_id !== userStoreId) throw new ForbiddenException('Access denied');
    } else if (role === Role.STORE_ADMIN) {
      if (invoice.store_id !== userStoreId) throw new ForbiddenException('Access denied');
    }

    return invoice;
  }

  async findOneByBillingId(billingId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { billing_id: billingId },
      select: {
        billing_id: true,
        invoice_number: true,
        subtotal: true,
        tax_amount: true,
        discount_amount: true,
        loyalty_discount: true,
        grand_total: true,
        status: true,
        created_at: true,
        items: {
          select: {
            name: true,
            quantity: true,
            unit_price: true,
            tax_rate: true,
            tax_amount: true,
            total: true,
          }
        },
        store: {
          select: {
            name: true,
            logo_url: true,
            address: true,
            city: true,
            phone: true,
            gst_number: true,
            brand_color: true,
          }
        },
        customer: {
          select: { name: true, phone: true }
        }
      }
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    // Redact PII for public portal consumers
    const phone = invoice.customer?.phone;
    return {
      ...invoice,
      customer: invoice.customer
        ? {
            name: invoice.customer.name,
            phone: phone ? this.maskPhone(phone) : null,
          }
        : null,
    };
  }

  private maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '****';
    return `****${digits.slice(-4)}`;
  }

  async findCustomerSummary(phone: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { customer: { phone }, status: { in: [InvoiceStatus.ACTIVE, InvoiceStatus.PARTIALLY_REFUNDED] } },
      select: {
        created_at: true,
        grand_total: true,
        billing_id: true,
        store: { select: { name: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 50
    });

    return invoices.map(inv => ({
      invoice_date: inv.created_at,
      store_name: inv.store?.name,
      grand_total: inv.grand_total,
      billing_id: inv.billing_id,
    }));
  }

  async voidInvoice(id: string, storeId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');
      if (invoice.store_id !== storeId) throw new ForbiddenException('Access denied');
      if (invoice.status === InvoiceStatus.FULLY_REFUNDED) throw new BadRequestException('Invoice is already voided');

      await tx.invoice.update({
        where: { id },
        data: { status: InvoiceStatus.FULLY_REFUNDED }
      });

      // Restore remaining sold stock (qty not already returned)
      for (const item of invoice.items) {
        if (!item.product_id) continue;
        const restoreQty = item.quantity - item.returned_quantity;
        if (restoreQty <= 0) continue;

        const inv = await tx.storeInventory.findFirst({
          where: { store_id: storeId, product_id: item.product_id },
        });
        if (inv) {
          await tx.storeInventory.update({
            where: { id: inv.id },
            data: { quantity: { increment: restoreQty } },
          });
        } else {
          await tx.storeInventory.create({
            data: {
              store_id: storeId,
              product_id: item.product_id,
              quantity: restoreQty,
            },
          });
        }

        await tx.invoiceItem.update({
          where: { id: item.id },
          data: { returned_quantity: item.quantity },
        });
      }

      if (invoice.customer_id) {
        const earned = invoice.loyalty_points_earned || 0;
        const redeemed = invoice.loyalty_points_redeemed || 0;
        // Reverse earn (remove points) and restore redeem (give points back)
        const loyaltyDelta = -earned + redeemed;

        await tx.customer.update({
          where: { id: invoice.customer_id },
          data: {
            total_spend: { decrement: invoice.grand_total },
            total_visits: { decrement: 1 },
            loyalty_points: { increment: loyaltyDelta },
          }
        });

        if (earned > 0) {
          await tx.loyaltyLedger.create({
            data: {
              customer_id: invoice.customer_id,
              invoice_id: invoice.id,
              points: -earned,
              type: LedgerType.ADJUSTED,
              description: `Void: reverse earned points on ${invoice.billing_id}`,
            }
          });
        }
        if (redeemed > 0) {
          await tx.loyaltyLedger.create({
            data: {
              customer_id: invoice.customer_id,
              invoice_id: invoice.id,
              points: redeemed,
              type: LedgerType.ADJUSTED,
              description: `Void: restore redeemed points on ${invoice.billing_id}`,
            }
          });
        }
      }

      await tx.auditLog.create({
        data: {
          brand_id: invoice.brand_id,
          user_id: userId,
          action: 'INVOICE_VOIDED',
          target_type: 'Invoice',
          target_id: invoice.id,
        }
      });

      return { message: 'Invoice voided successfully' };
    });
  }

  async getGeneratePdf(id: string, role: string, userStoreId?: string, userId?: string, brandId?: string) {
    const invoice = await this.findOne(id, role, userStoreId, userId, brandId);
    
    if (invoice.invoice_pdf_url) {
      return { url: invoice.invoice_pdf_url };
    }

    const s3Url = await this.pdfService.generateInvoicePdf(invoice);
    
    await this.prisma.invoice.update({
      where: { id },
      data: { invoice_pdf_url: s3Url }
    });

    return { url: s3Url };
  }

  async markShared(
    id: string,
    role: string,
    brandId: string,
    userStoreId?: string,
    userId?: string,
  ) {
    await this.findOne(id, role, userStoreId, userId, brandId);

    await this.prisma.invoice.update({
      where: { id },
      data: { share_triggered: true },
    });

    return { message: 'Invoice marked as shared' };
  }
}
