import 'package:hive/hive.dart';

part 'hive_models.g.dart'; // Needed for build_runner

@HiveType(typeId: 0)
class CachedProduct extends HiveObject {
  @HiveField(0)
  final String id;
  
  @HiveField(1)
  final String name;
  
  @HiveField(2)
  final num basePrice;
  
  @HiveField(3)
  final num taxRate;
  
  @HiveField(4)
  final String? barcode;

  @HiveField(5)
  final String? category;

  CachedProduct({
    required this.id,
    required this.name,
    required this.basePrice,
    required this.taxRate,
    this.barcode,
    this.category,
  });
}

@HiveType(typeId: 1)
class CachedCustomer extends HiveObject {
  @HiveField(0)
  final String id;
  
  @HiveField(1)
  final String phone;
  
  @HiveField(2)
  final String name;

  @HiveField(3)
  final num loyaltyPoints;

  CachedCustomer({
    required this.id,
    required this.phone,
    required this.name,
    required this.loyaltyPoints,
  });
}

@HiveType(typeId: 2)
class OfflineInvoiceItem extends HiveObject {
  @HiveField(0)
  final String? productId;

  @HiveField(1)
  final String name;
  
  @HiveField(2)
  final int quantity;

  @HiveField(3)
  final num unitPrice;

  @HiveField(4)
  final num taxRate;

  OfflineInvoiceItem({
    this.productId,
    required this.name,
    required this.quantity,
    required this.unitPrice,
    required this.taxRate,
  });
}

@HiveType(typeId: 3)
class OfflineInvoice extends HiveObject {
  @HiveField(0)
  final String billingId; // The mocked billing_id generated offline

  @HiveField(1)
  final String? customerId;

  @HiveField(2)
  final String? customerPhone;

  @HiveField(3)
  final String? customerName;

  @HiveField(4)
  final List<OfflineInvoiceItem> items;

  @HiveField(5)
  final num discountAmount;

  @HiveField(6)
  final num loyaltyPointsRedeemed;

  @HiveField(7)
  final num taxAmount;

  @HiveField(8)
  final num subtotal;

  @HiveField(9)
  final num grandTotal;

  @HiveField(10)
  final DateTime createdAt;

  OfflineInvoice({
    required this.billingId,
    this.customerId,
    this.customerPhone,
    this.customerName,
    required this.items,
    required this.discountAmount,
    required this.loyaltyPointsRedeemed,
    required this.taxAmount,
    required this.subtotal,
    required this.grandTotal,
    required this.createdAt,
  });
}
