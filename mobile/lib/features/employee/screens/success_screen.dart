import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../config/theme.dart';

class SuccessScreen extends StatelessWidget {
  final Map<String, dynamic> invoiceData;

  const SuccessScreen({Key? key, required this.invoiceData}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              const Icon(Icons.check_circle, size: 100, color: AppTheme.successColor),
              const SizedBox(height: 24),
              const Text('Invoice Shared Successfully!', 
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)
              ),
              const SizedBox(height: 16),
              Text('Invoice: ${invoiceData['invoice_number']}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, color: Colors.grey)),
              Text('Billing ID: ${invoiceData['billing_id']}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: Colors.grey)),
              
              const Spacer(),
              OutlinedButton.icon(
                icon: const Icon(Icons.receipt_long),
                label: const Text('View Bill'),
                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                onPressed: () {
                  context.pushReplacement('/employee/pos/invoice', extra: invoiceData['id']);
                },
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                icon: const Icon(Icons.add_shopping_cart, color: Colors.white),
                label: const Text('New Bill'),
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                onPressed: () {
                  context.go('/employee/pos'); // Reset to root of employee POS
                },
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
