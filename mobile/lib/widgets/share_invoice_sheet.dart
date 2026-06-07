import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../config/theme.dart';
import '../core/utils/whatsapp_service.dart';

class ShareInvoiceSheet extends StatelessWidget {
  final String? customerPhone;
  final String storeName;
  final num grandTotal;
  final String billingId;
  final String? invoiceNumber;
  final File pdfFile;

  const ShareInvoiceSheet({
    super.key,
    this.customerPhone,
    required this.storeName,
    required this.grandTotal,
    required this.billingId,
    this.invoiceNumber,
    required this.pdfFile,
  });

  @override
  Widget build(BuildContext context) {
    final hasPhone = customerPhone != null && customerPhone!.isNotEmpty;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Title
          const Text(
            'Share Invoice',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            '₹${grandTotal.toStringAsFixed(2)}',
            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: AppTheme.primaryColor),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),

          // WhatsApp Direct Send button
          if (hasPhone) ...[
            ElevatedButton.icon(
              icon: const Icon(Icons.send, color: Colors.white, size: 20),
              label: Text(
                'Send on WhatsApp to ${_maskedPhone(customerPhone!)}',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF25D366), // WhatsApp green
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              onPressed: () async {
                Navigator.pop(context, 'whatsapp');
                final message = WhatsAppService.buildInvoiceMessage(
                  storeName: storeName,
                  grandTotal: grandTotal,
                  billingId: billingId,
                  invoiceNumber: invoiceNumber,
                );
                await WhatsAppService.shareInvoice(
                  phone: customerPhone!,
                  message: message,
                  pdfFilePath: pdfFile.path,
                );
              },
            ),
            const SizedBox(height: 12),
          ],

          // Generic Share (with PDF)
          OutlinedButton.icon(
            icon: const Icon(Icons.share, size: 20),
            label: const Text(
              'Share via other apps',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
            ),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              side: BorderSide(color: Colors.grey.shade300),
            ),
            onPressed: () async {
              Navigator.pop(context, 'share');
              final text = "Thank you for shopping at $storeName!\n"
                  "Your bill: ₹${grandTotal.toStringAsFixed(2)}\n"
                  "View invoice: bills.billpush.com/v/$billingId";
              await SharePlus.instance.share(
                ShareParams(
                  files: [XFile(pdfFile.path)],
                  text: text,
                ),
              );
            },
          ),
          const SizedBox(height: 12),

          // Copy link
          TextButton.icon(
            icon: Icon(Icons.copy, size: 18, color: Colors.grey.shade600),
            label: Text(
              'Copy bill link',
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
            ),
            onPressed: () {
              final link = 'bills.billpush.com/v/$billingId';
              Clipboard.setData(ClipboardData(text: link));
              Navigator.pop(context, 'copy');
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Bill link copied to clipboard!'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
          ),
          SizedBox(height: MediaQuery.of(context).padding.bottom + 8),
        ],
      ),
    );
  }

  String _maskedPhone(String phone) {
    final cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');
    if (cleaned.length >= 10) {
      final last4 = cleaned.substring(cleaned.length - 4);
      return '****$last4';
    }
    return phone;
  }
}
