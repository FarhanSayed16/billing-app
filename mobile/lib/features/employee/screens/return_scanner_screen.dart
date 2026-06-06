import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../widgets/custom_widgets.dart';

class ReturnScannerScreen extends ConsumerStatefulWidget {
  const ReturnScannerScreen({super.key});

  @override
  ConsumerState<ReturnScannerScreen> createState() => _ReturnScannerScreenState();
}

class _ReturnScannerScreenState extends ConsumerState<ReturnScannerScreen> {
  final MobileScannerController _controller = MobileScannerController();
  final _manualCtrl = TextEditingController();
  bool _scanned = false;

  @override
  void dispose() {
    _controller.dispose();
    _manualCtrl.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_scanned) return;
    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      if (barcode.rawValue != null) {
        _scanned = true;
        _proceedToReturn(barcode.rawValue!);
        break;
      }
    }
  }

  void _proceedToReturn(String billingId) {
    // If the QR contains a full URL like bills.billpush.com/v/INV123, extract the ID
    String id = billingId;
    if (id.contains('/v/')) {
      id = id.split('/v/').last;
    }
    context.pushReplacement('/employee/pos/returns/process', extra: id);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Scan Return QR'),
      body: Column(
        children: [
          Expanded(
            flex: 3,
            child: MobileScanner(
              controller: _controller,
              onDetect: _onDetect,
              errorBuilder: (context, error) => Center(child: Text('Camera Error: ${error.errorCode}')),
            ),
          ),
          Expanded(
            flex: 2,
            child: Container(
              padding: const EdgeInsets.all(24),
              color: Theme.of(context).colorScheme.surface,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Or enter Billing ID manually:'),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: BillPushTextField(
                          label: 'Billing ID',
                          controller: _manualCtrl,
                        ),
                      ),
                      const SizedBox(width: 16),
                      ElevatedButton(
                        onPressed: () {
                          if (_manualCtrl.text.isNotEmpty) {
                            _proceedToReturn(_manualCtrl.text.trim());
                          }
                        },
                        child: const Text('Go'),
                      )
                    ],
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
