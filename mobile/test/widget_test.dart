import 'package:flutter_test/flutter_test.dart';
import 'package:billpush/config/constants.dart';
import 'package:billpush/providers/cart_provider.dart';

void main() {
  group('AppConstants', () {
    test('invoice portal URL uses /invoice path', () {
      final url = AppConstants.invoicePortalUrl('ABC123');
      expect(url.endsWith('/invoice/ABC123'), isTrue);
      expect(url.contains('/v/'), isFalse);
    });
  });

  group('CartItem', () {
    test('catalog items carry productId for stock decrement', () {
      final item = CartItem(
        id: 'local-1',
        productId: 'prod-uuid',
        name: 'Tea',
        unitPrice: 50,
        quantity: 2,
        taxRate: 5,
      );
      expect(item.productId, 'prod-uuid');
      expect(item.lineTotal, 100);
    });

    test('manual items omit productId', () {
      final item = CartItem(
        id: 'manual-1',
        name: 'Custom',
        unitPrice: 10,
      );
      expect(item.productId, isNull);
    });
  });

  group('CartState loyalty/discount', () {
    test('grand total never goes negative', () {
      final state = CartState(
        items: [CartItem(id: '1', name: 'A', unitPrice: 10, quantity: 1)],
        discountAmount: 100,
        loyaltyDiscount: 50,
      );
      expect(state.grandTotal, 0);
    });
  });
}
