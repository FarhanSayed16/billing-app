import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/constants.dart';

class WhatsAppService {
  /// Formats a phone number to WhatsApp international format.
  /// Strips +, spaces, dashes, and prepends 91 (India) if needed.
  static String formatPhoneNumber(String phone) {
    // Remove all non-digit characters
    String cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');

    // If starts with 0, remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // If it's 10 digits (Indian local), prepend 91
    if (cleaned.length == 10) {
      cleaned = '91$cleaned';
    }

    return cleaned;
  }

  /// Share invoice with PDF attached.
  /// Prefers the system share sheet (so WhatsApp receives the PDF file).
  /// Falls back to WhatsApp deep-link text/chat if sharing files fails.
  static Future<bool> shareInvoice({
    required String phone,
    required String message,
    required String pdfFilePath,
  }) async {
    if (pdfFilePath.isNotEmpty) {
      try {
        await SharePlus.instance.share(
          ShareParams(
            files: [XFile(pdfFilePath)],
            text: message,
          ),
        );
        return true;
      } catch (_) {
        // Fall through to text deep-link
      }
    }

    final formattedPhone = formatPhoneNumber(phone);
    final encodedMessage = Uri.encodeComponent(message);

    final whatsappUri = Uri.parse('whatsapp://send?phone=$formattedPhone&text=$encodedMessage');
    try {
      if (await canLaunchUrl(whatsappUri)) {
        await launchUrl(whatsappUri, mode: LaunchMode.externalApplication);
        return true;
      }
    } catch (_) {}

    final webUri = Uri.parse('https://wa.me/$formattedPhone?text=$encodedMessage');
    try {
      if (await canLaunchUrl(webUri)) {
        await launchUrl(webUri, mode: LaunchMode.externalApplication);
        return true;
      }
    } catch (_) {}

    return false;
  }

  /// Build a formatted bill message for WhatsApp.
  static String buildInvoiceMessage({
    required String storeName,
    required num grandTotal,
    required String billingId,
    String? invoiceNumber,
  }) {
    final buffer = StringBuffer();
    buffer.writeln('🧾 *Invoice from $storeName*');
    buffer.writeln();
    buffer.writeln('Thank you for your purchase!');
    buffer.writeln();
    buffer.writeln('💰 Total: ₹${grandTotal.toStringAsFixed(2)}');
    if (invoiceNumber != null) {
      buffer.writeln('📄 Invoice #: $invoiceNumber');
    }
    buffer.writeln();
    buffer.writeln('📥 View & Download your bill:');
    buffer.writeln(AppConstants.invoicePortalUrl(billingId));
    buffer.writeln();
    buffer.writeln('_Powered by BillPush_');
    return buffer.toString();
  }
}
