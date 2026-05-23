import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReturn(user: any, dto: CreateReturnDto) {
    const { brand_id, store_id, id: employee_id } = user;

    // 1. Fetch Brand config
    const brand = await this.prisma.brand.findUnique({
      where: { id: brand_id },
      select: { return_auto_approve_threshold: true, loyalty_points_per_100: true },
    });

    if (!brand) throw new BadRequestException('Brand config not found');

    // 2. Fetch Invoice
    const invoice = await this.prisma.invoice.findUnique({
      where: { billing_id: dto.billing_id },
      include: { items: true },
    });

    if (!invoice || invoice.store_id !== store_id) {
      throw new NotFoundException('Invoice not found in this store');
    }

    if (invoice.status === 'FULLY_REFUNDED') {
      throw new BadRequestException('Invoice is already fully refunded');
    }

    let refundAmount = 0;
    const returnItemsData: any[] = [];

    // 3. Process items and validate quantities
    for (const returnItem of dto.items) {
      const originalItem = invoice.items.find(i => i.id === returnItem.invoice_item_id);
      if (!originalItem) {
        throw new BadRequestException(`Item ${returnItem.invoice_item_id} not found on invoice`);
      }

      const availableToReturn = originalItem.quantity - originalItem.returned_quantity;
      if (returnItem.quantity > availableToReturn) {
        throw new BadRequestException(`Cannot return ${returnItem.quantity} of ${originalItem.name}. Only ${availableToReturn} available.`);
      }

      const unitRefundData = Number(originalItem.total) / originalItem.quantity;
      refundAmount += unitRefundData * returnItem.quantity;

      returnItemsData.push({
        invoice_item_id: originalItem.id,
        quantity: returnItem.quantity,
      });
    }

    const maxPointsReversible = invoice.loyalty_points_earned;
    let pointsReversed = Math.floor(refundAmount / 100) * (brand.loyalty_points_per_100 || 1);
    if (pointsReversed > maxPointsReversible) pointsReversed = maxPointsReversible;

    const autoApprove = refundAmount <= Number(brand.return_auto_approve_threshold);
    const newStatus = autoApprove ? 'APPROVED' : 'PENDING';

    const returnRequest = await this.prisma.$transaction(async (tx) => {
      // Create return request
      const request = await tx.returnRequest.create({
        data: {
          invoice_id: invoice.id,
          store_id,
          brand_id,
          employee_id,
          status: newStatus,
          refund_amount: refundAmount,
          loyalty_points_reversed: pointsReversed,
          reason: dto.reason,
          items: {
            create: returnItemsData,
          },
        },
      });

      if (autoApprove) {
        // Execute approval logic (which includes its own audit log)
        await this._executeApprovalLogic(tx, request.id, invoice, returnItemsData, pointsReversed, employee_id, brand_id);
      } else {
        // Audit log for pending return submission
        await tx.auditLog.create({
          data: {
            brand_id,
            user_id: employee_id,
            action: 'RETURN_SUBMITTED',
            target_type: 'Invoice',
            target_id: invoice.id,
            metadata: { returnRequestId: request.id, refundAmount: refundAmount, status: 'PENDING' },
          },
        });
      }

      return request;
    });

    return {
      message: autoApprove ? 'Return approved and processed successfully' : 'Return submitted for approval',
      returnRequest,
    };
  }

  async getPendingReturns(storeId: string, brandId: string) {
    return this.prisma.returnRequest.findMany({
      where: { store_id: storeId, brand_id: brandId, status: 'PENDING' },
      include: {
        items: { include: { invoice_item: true } },
        invoice: { select: { billing_id: true, customer: { select: { name: true, phone: true } } } },
        employee: { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async approveReturn(user: any, requestId: string) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id: requestId },
      include: { items: true, invoice: { include: { items: true } } },
    });

    if (!request || request.brand_id !== user.brand_id) throw new NotFoundException('Return request not found');
    if (request.status !== 'PENDING') throw new BadRequestException(`Request is already ${request.status}`);

    await this.prisma.$transaction(async (tx) => {
      await tx.returnRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });

      await this._executeApprovalLogic(tx, requestId, request.invoice, request.items, request.loyalty_points_reversed, user.id, user.brand_id);
    });

    return { message: 'Return request approved successfully' };
  }

  async rejectReturn(user: any, requestId: string) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.brand_id !== user.brand_id) throw new NotFoundException('Return request not found');
    if (request.status !== 'PENDING') throw new BadRequestException(`Request is already ${request.status}`);

    await this.prisma.$transaction(async (tx) => {
      await tx.returnRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });

      await tx.auditLog.create({
        data: {
          brand_id: request.brand_id,
          user_id: user.id,
          action: 'RETURN_REJECTED',
          target_type: 'Invoice',
          target_id: request.invoice_id,
          metadata: { returnRequestId: requestId },
        },
      });
    });

    return { message: 'Return request rejected' };
  }

  private async _executeApprovalLogic(tx: any, requestId: string, invoice: any, returnItemsData: any[], pointsReversed: number, adminId: string, brandId: string) {
    // 1. Update returned quantities
    let totalItemsInInvoice = 0;
    let totalItemsReturnedSoFar = 0;

    for (const item of invoice.items) {
      totalItemsInInvoice += item.quantity;
      totalItemsReturnedSoFar += item.returned_quantity;
    }

    let newlyReturnedSum = 0;
    for (const returnItem of returnItemsData) {
      newlyReturnedSum += returnItem.quantity;
      await tx.invoiceItem.update({
        where: { id: returnItem.invoice_item_id },
        data: { returned_quantity: { increment: returnItem.quantity } },
      });
      // Optionally increment inventory back here (removed from phase 4, so skip inventory)
    }

    // 2. Update invoice status
    totalItemsReturnedSoFar += newlyReturnedSum;
    const invoiceStatus = totalItemsReturnedSoFar >= totalItemsInInvoice ? 'FULLY_REFUNDED' : 'PARTIALLY_REFUNDED';
    
    await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: invoiceStatus },
    });

    // 3. Loyalty reversal
    if (pointsReversed > 0 && invoice.customer_id) {
      await tx.customer.update({
        where: { id: invoice.customer_id },
        data: { loyalty_points: { decrement: pointsReversed } },
      });

      await tx.loyaltyLedger.create({
        data: {
          customer_id: invoice.customer_id,
          invoice_id: invoice.id,
          type: 'ADJUSTED',
          points: -pointsReversed,
          description: `Reversal for returned items on ${invoice.billing_id}`,
        },
      });
    }

    // 4. Audit Log
    await tx.auditLog.create({
      data: {
        brand_id: brandId,
        user_id: adminId,
        action: 'RETURN_APPROVED',
        target_type: 'Invoice',
        target_id: invoice.id,
        metadata: { returnRequestId: requestId },
      },
    });
  }
}
