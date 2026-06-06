import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../widgets/toast_widget.dart';
import '../../../providers/api_provider.dart';
import '../../../providers/cart_provider.dart';
import '../../../config/theme.dart';

import '../../../providers/connectivity_provider.dart';
import '../../../core/storage/hive_service.dart';

class BarcodeScanScreen extends ConsumerStatefulWidget {
  const BarcodeScanScreen({super.key});

  @override
  ConsumerState<BarcodeScanScreen> createState() => _BarcodeScanScreenState();
}

class _BarcodeScanScreenState extends ConsumerState<BarcodeScanScreen> {
  final MobileScannerController _controller = MobileScannerController(
    formats: const [BarcodeFormat.all],
    detectionSpeed: DetectionSpeed.normal,
  );

  bool _isProcessing = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _processBarcode(String barcodeString) async {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);
    
    // Provide haptic feedback instantly on detection
    HapticFeedback.lightImpact();

    try {
      final isOnline = ref.read(connectivityProvider).isOnline;
      Map<String, dynamic>? productData;

      if (isOnline) {
        final dio = ref.read(dioProvider);
        final res = await dio.get('/products/barcode/$barcodeString');
        productData = res.data;
      } else {
        final cachedProduct = HiveService.productsBox.values.firstWhere((p) => p.barcode == barcodeString);
        productData = {
          'id': cachedProduct.id,
          'name': cachedProduct.name,
          'base_price': cachedProduct.basePrice,
          'tax_rate': cachedProduct.taxRate,
        };
      }

      if (productData == null) {
        throw Exception('Product data is null');
      }

      final item = CartItem(
        id: productData['id'], // product ID
        name: productData['name'],
        unitPrice: num.parse(productData['base_price'].toString()),
        quantity: 1,
        taxRate: num.parse(productData['tax_rate'].toString()),
      );

      ref.read(cartProvider.notifier).addItem(item);
      
      if (mounted) {
        BillPushToast.success(context, 'Added ${productData['name']} to cart');
        HapticFeedback.mediumImpact();
        // Give it a small resting window so it doesn't scan 50 times a second
        await Future.delayed(const Duration(seconds: 1));
      }
    } catch (e) {
      if (mounted) {
        BillPushToast.error(context, 'Product not found / ${e.toString()}');
        await Future.delayed(const Duration(seconds: 2));
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(
        title: 'Scan Barcode',
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: (capture) {
              final List<Barcode> barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                if (barcode.rawValue != null && !_isProcessing) {
                  _processBarcode(barcode.rawValue!);
                  break; 
                }
              }
            },
          ),
          
          // Custom Overlay Target
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.primaryColor, width: 4),
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          
          // Flash toggle logic
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FloatingActionButton(
                  heroTag: 'flash',
                  backgroundColor: Theme.of(context).colorScheme.surface,
                  child: Icon(Icons.highlight, color: Theme.of(context).colorScheme.onSurface),
                  onPressed: () => _controller.toggleTorch(),
                ),
                const SizedBox(width: 20),
                FloatingActionButton(
                  heroTag: 'manual',
                  backgroundColor: AppTheme.primaryColor,
                  child: const Icon(Icons.keyboard),
                  onPressed: () => Navigator.pop(context), // Go back to cart to type manually
                ),
              ],
            ),
          ),
          
          if (_isProcessing)
            Container(
              color: Colors.black45,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }
}
