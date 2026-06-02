import 'package:hive_flutter/hive_flutter.dart';
import 'hive_models.dart';

class HiveService {
  static const String productsBoxName = 'products_box';
  static const String customersBoxName = 'customers_box';
  static const String invoicesBoxName = 'invoices_box';
  static const String storeBoxName = 'store_box';

  static late Box<CachedProduct> productsBox;
  static late Box<CachedCustomer> customersBox;
  static late Box<OfflineInvoice> invoicesBox;
  static late Box storeBox;

  static Future<void> init() async {
    await Hive.initFlutter();
    
    // Register adapters
    if (!Hive.isAdapterRegistered(0)) Hive.registerAdapter(CachedProductAdapter());
    if (!Hive.isAdapterRegistered(1)) Hive.registerAdapter(CachedCustomerAdapter());
    if (!Hive.isAdapterRegistered(2)) Hive.registerAdapter(OfflineInvoiceItemAdapter());
    if (!Hive.isAdapterRegistered(3)) Hive.registerAdapter(OfflineInvoiceAdapter());

    // Open boxes
    productsBox = await Hive.openBox<CachedProduct>(productsBoxName);
    customersBox = await Hive.openBox<CachedCustomer>(customersBoxName);
    invoicesBox = await Hive.openBox<OfflineInvoice>(invoicesBoxName);
    storeBox = await Hive.openBox(storeBoxName);
  }
}
