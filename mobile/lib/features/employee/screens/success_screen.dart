import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../config/theme.dart';
import '../../../core/utils/whatsapp_service.dart';

class SuccessScreen extends StatelessWidget {
  final Map<String, dynamic> invoiceData;

  const SuccessScreen({super.key, required this.invoiceData});

  @override
  Widget build(BuildContext context) {
    final customerPhone = invoiceData['customer_phone']?.toString();
    final hasPhone = customerPhone != null && customerPhone.isNotEmpty;

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
              const Text('Invoice Created Successfully!', 
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)
              ),
              const SizedBox(height: 16),
              Text('Invoice: ${invoiceData['invoice_number'] ?? ''}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, color: Colors.grey)),
              Text('Billing ID: ${invoiceData['billing_id'] ?? ''}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: Colors.grey)),
              
              const Spacer(),

              // Resend on WhatsApp
              if (hasPhone)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.send, color: Colors.white, size: 20),
                    label: const Text('Resend on WhatsApp', style: TextStyle(color: Colors.white)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF25D366),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () async {
                      final message = WhatsAppService.buildInvoiceMessage(
                        storeName: invoiceData['store_name'] ?? 'Store',
                        grandTotal: num.tryParse(invoiceData['grand_total']?.toString() ?? '0') ?? 0,
                        billingId: invoiceData['billing_id'] ?? '',
                        invoiceNumber: invoiceData['invoice_number'],
                      );
                      // For resend, we send the text message via WhatsApp
                      // (PDF is not regenerated here, but the link is included)
                      try {
                        await WhatsAppService.shareInvoice(
                          phone: customerPhone,
                          message: message,
                          pdfFilePath: '', // No PDF for resend — message + link only
                        );
                      } catch (_) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Could not open WhatsApp')),
                          );
                        }
                      }
                    },
                  ),
                ),

              OutlinedButton.icon(
                icon: const Icon(Icons.receipt_long),
                label: const Text('View Bill'),
                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                onPressed: () {
                  context.pushReplacement('/employee/pos/invoice', extra: invoiceData['id']);
                },
              ),
              const SizedBox(height: 12),
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
