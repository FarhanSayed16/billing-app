// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'hive_models.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class CachedProductAdapter extends TypeAdapter<CachedProduct> {
  @override
  final int typeId = 0;

  @override
  CachedProduct read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return CachedProduct(
      id: fields[0] as String,
      name: fields[1] as String,
      basePrice: fields[2] as num,
      taxRate: fields[3] as num,
      barcode: fields[4] as String?,
      category: fields[5] as String?,
    );
  }

  @override
  void write(BinaryWriter writer, CachedProduct obj) {
    writer
      ..writeByte(6)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.basePrice)
      ..writeByte(3)
      ..write(obj.taxRate)
      ..writeByte(4)
      ..write(obj.barcode)
      ..writeByte(5)
      ..write(obj.category);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CachedProductAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class CachedCustomerAdapter extends TypeAdapter<CachedCustomer> {
  @override
  final int typeId = 1;

  @override
  CachedCustomer read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return CachedCustomer(
      id: fields[0] as String,
      phone: fields[1] as String,
      name: fields[2] as String,
      loyaltyPoints: fields[3] as num,
    );
  }

  @override
  void write(BinaryWriter writer, CachedCustomer obj) {
    writer
      ..writeByte(4)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.phone)
      ..writeByte(2)
      ..write(obj.name)
      ..writeByte(3)
      ..write(obj.loyaltyPoints);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CachedCustomerAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class OfflineInvoiceItemAdapter extends TypeAdapter<OfflineInvoiceItem> {
  @override
  final int typeId = 2;

  @override
  OfflineInvoiceItem read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return OfflineInvoiceItem(
      productId: fields[0] as String?,
      name: fields[1] as String,
      quantity: fields[2] as int,
      unitPrice: fields[3] as num,
      taxRate: fields[4] as num,
    );
  }

  @override
  void write(BinaryWriter writer, OfflineInvoiceItem obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.productId)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.quantity)
      ..writeByte(3)
      ..write(obj.unitPrice)
      ..writeByte(4)
      ..write(obj.taxRate);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is OfflineInvoiceItemAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class OfflineInvoiceAdapter extends TypeAdapter<OfflineInvoice> {
  @override
  final int typeId = 3;

  @override
  OfflineInvoice read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return OfflineInvoice(
      billingId: fields[0] as String,
      customerId: fields[1] as String?,
      customerPhone: fields[2] as String?,
      customerName: fields[3] as String?,
      items: (fields[4] as List).cast<OfflineInvoiceItem>(),
      discountAmount: fields[5] as num,
      loyaltyPointsRedeemed: fields[6] as num,
      taxAmount: fields[7] as num,
      subtotal: fields[8] as num,
      grandTotal: fields[9] as num,
      createdAt: fields[10] as DateTime,
    );
  }

  @override
  void write(BinaryWriter writer, OfflineInvoice obj) {
    writer
      ..writeByte(11)
      ..writeByte(0)
      ..write(obj.billingId)
      ..writeByte(1)
      ..write(obj.customerId)
      ..writeByte(2)
      ..write(obj.customerPhone)
      ..writeByte(3)
      ..write(obj.customerName)
      ..writeByte(4)
      ..write(obj.items)
      ..writeByte(5)
      ..write(obj.discountAmount)
      ..writeByte(6)
      ..write(obj.loyaltyPointsRedeemed)
      ..writeByte(7)
      ..write(obj.taxAmount)
      ..writeByte(8)
      ..write(obj.subtotal)
      ..writeByte(9)
      ..write(obj.grandTotal)
      ..writeByte(10)
      ..write(obj.createdAt);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is OfflineInvoiceAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
