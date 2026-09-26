import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import '../storage/hive_service.dart';
import '../storage/hive_models.dart';

class SyncService {
  static late StreamSubscription<List<ConnectivityResult>> _subscription;
  static bool _isSyncing = false;
  static late Dio _dio;
  static bool _initialized = false;

  static void init(Dio dio) {
    if (_initialized) {
      _dio = dio;
      return;
    }
    _initialized = true;
    _dio = dio;
    _subscription = Connectivity().onConnectivityChanged.listen((results) {
      if (!results.contains(ConnectivityResult.none)) {
        syncPendingInvoices();
      }
    });

    Connectivity().checkConnectivity().then((results) {
      if (!results.contains(ConnectivityResult.none)) {
        syncPendingInvoices();
      }
    });
  }

  static Future<void> enqueueOfflineInvoice(OfflineInvoice invoice) async {
    await HiveService.invoicesBox.add(invoice);
    // Attempt immediate sync if online
    final results = await Connectivity().checkConnectivity();
    if (!results.contains(ConnectivityResult.none)) {
      await syncPendingInvoices();
    }
  }

  static Future<void> syncPendingInvoices() async {
    if (_isSyncing) return;
    _isSyncing = true;

    try {
      final box = HiveService.invoicesBox;

      while (box.isNotEmpty) {
        final pendingInvoices = box.values.toList();
        bool syncStalled = false;

        for (var offlineInvoice in pendingInvoices) {
          try {
            final payload = {
              'billing_id': offlineInvoice.billingId,
              if (offlineInvoice.customerId != null) 'customer_id': offlineInvoice.customerId,
              'customer_phone': offlineInvoice.customerPhone,
              'customer_name': offlineInvoice.customerName,
              'items': offlineInvoice.items
                  .map((i) => {
                        if (i.productId != null) 'product_id': i.productId,
                        'name': i.name,
                        'quantity': i.quantity,
                        'unit_price': i.unitPrice,
                        'tax_rate': i.taxRate,
                      })
                  .toList(),
              'discount_amount': offlineInvoice.discountAmount,
              'loyalty_points_redeemed': offlineInvoice.loyaltyPointsRedeemed,
            };

            await _dio.post('/invoices', data: payload);
            await offlineInvoice.delete();
          } catch (e) {
            if (e is DioException && e.response?.statusCode != null && e.response!.statusCode! >= 400 && e.response!.statusCode! < 500) {
              // Drop permanently rejected offline invoices to avoid infinite stall
              await offlineInvoice.delete();
              continue;
            }
            syncStalled = true;
            break;
          }
        }

        if (syncStalled) {
          break;
        }
      }
    } finally {
      _isSyncing = false;
    }
  }

  static void dispose() {
    if (_initialized) {
      _subscription.cancel();
      _initialized = false;
    }
  }
}
