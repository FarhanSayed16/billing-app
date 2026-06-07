import 'package:flutter_riverpod/flutter_riverpod.dart';

class CartItem {
  final String id;
  final String name;
  final num unitPrice;
  int quantity;
  final num taxRate; // e.g. 5, 12, 18

  CartItem({
    required this.id,
    required this.name,
    required this.unitPrice,
    this.quantity = 1,
    this.taxRate = 0,
  });

  num get lineTotal => unitPrice * quantity;
}

class CustomerInfo {
  final String? id;
  final String name;
  final String phone;
  final num loyaltyPoints;

  CustomerInfo({this.id, required this.name, required this.phone, this.loyaltyPoints = 0});
}

class CartState {
  final List<CartItem> items;
  final CustomerInfo? customer;
  final num discountAmount;
  final num loyaltyDiscount;

  CartState({
    this.items = const [],
    this.customer,
    this.discountAmount = 0,
    this.loyaltyDiscount = 0,
  });

  CartState copyWith({
    List<CartItem>? items,
    CustomerInfo? customer,
    num? discountAmount,
    num? loyaltyDiscount,
  }) {
    return CartState(
      items: items ?? this.items,
      customer: customer ?? this.customer,
      discountAmount: discountAmount ?? this.discountAmount,
      loyaltyDiscount: loyaltyDiscount ?? this.loyaltyDiscount,
    );
  }

  num get subtotal => items.fold(0, (sum, item) => sum + item.lineTotal);
  
  num get taxAmount {
    // Basic tax calculation based on item tax rates
    return items.fold(0, (sum, item) {
      final taxableAmount = item.lineTotal; // Ignoring item-level proportional discounts for MVP
      return sum + (taxableAmount * (item.taxRate / 100));
    });
  }

  num get grandTotal {
    final total = (subtotal + taxAmount) - discountAmount - loyaltyDiscount;
    return total > 0 ? total : 0;
  }
}

class CartNotifier extends Notifier<CartState> {
  @override
  CartState build() => CartState();

  void setCustomer(CustomerInfo customer) {
    state = state.copyWith(customer: customer);
  }

  void addItem(CartItem item) {
    final existingIndex = state.items.indexWhere((i) => i.id == item.id);
    if (existingIndex >= 0) {
      final newItems = List<CartItem>.from(state.items);
      newItems[existingIndex].quantity += item.quantity;
      state = state.copyWith(items: newItems);
    } else {
      state = state.copyWith(items: [...state.items, item]);
    }
  }

  void updateQuantity(String id, int delta) {
    final newItems = state.items.map((item) {
      if (item.id == id) {
        final newQty = item.quantity + delta;
        if (newQty > 0) item.quantity = newQty;
      }
      return item;
    }).toList();
    state = state.copyWith(items: newItems);
  }

  void removeItem(String id) {
    state = state.copyWith(items: state.items.where((i) => i.id != id).toList());
  }

  void setDiscount(num amount) {
    state = state.copyWith(discountAmount: amount);
  }

  void setLoyaltyDiscount(num amount) {
    state = state.copyWith(loyaltyDiscount: amount);
  }

  void clearCart() {
    state = CartState();
  }
}

final cartProvider = NotifierProvider<CartNotifier, CartState>(() => CartNotifier());
