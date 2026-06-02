import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import '../storage/hive_service.dart';

class SyncService {
  static late StreamSubscription<List<ConnectivityResult>> _subscription;
  static bool _isSyncing = false;
  static late Dio _dio;

  static void init(Dio dio) {
    _dio = dio;
    _subscription = Connectivity().onConnectivityChanged.listen((results) {
      if (!results.contains(ConnectivityResult.none)) {
        _syncPendingInvoices();
      }
    });

    // Run once on init just in case
    Connectivity().checkConnectivity().then((results) {
       if (!results.contains(ConnectivityResult.none)) {
        _syncPendingInvoices();
      }
    });
  }

  static Future<void> _syncPendingInvoices() async {
    if (_isSyncing) return;
    _isSyncing = true;

    try {
      final box = HiveService.invoicesBox;
      
      // Keep trying while box has items. Using a loop handles if the box grows during sync.
      // But iterate over a copied list to prevent concurrent mod exceptions.
      while (box.isNotEmpty) {
        final pendingInvoices = box.values.toList();
        bool syncStalled = false;

        for (var offlineInvoice in pendingInvoices) {
          try {
            final payload = {
              // we don't send billing_id, backend Prisma handles it unless we specifically override
              // Actually since we generated `billing_id` locally so QR code resolves, we should supply it if backend accepts it
              'billing_id': offlineInvoice.billingId, 
              'customer_id': offlineInvoice.customerId,
              'customer_phone': offlineInvoice.customerPhone,
              'customer_name': offlineInvoice.customerName,
              'items': offlineInvoice.items.map((i) => {
                'name': i.name,
                'quantity': i.quantity,
                'unit_price': i.unitPrice,
                'tax_rate': i.taxRate,
              }).toList(),
              'discount_amount': offlineInvoice.discountAmount,
              'loyalty_points_redeemed': offlineInvoice.loyaltyPointsRedeemed,
              'tax_amount': offlineInvoice.taxAmount,
              'subtotal': offlineInvoice.subtotal,
              'grand_total': offlineInvoice.grandTotal,
              'createdAt': offlineInvoice.createdAt.toIso8601String(), // Optional, if backend takes local time
            };

            await _dio.post('/invoices', data: payload);
            
            // Delete upon success
            await offlineInvoice.delete();
          } catch (e) {
            // If network fails midway, break and wait for next tick
            syncStalled = true;
            break; 
          }
        }

        if (syncStalled) {
           break; // Stop attempting until reconnect
        }
      }
    } finally {
      _isSyncing = false;
    }
  }

  static void dispose() {
    _subscription.cancel();
  }
}
