import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

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

  /// Share a PDF invoice directly to a WhatsApp number.
  /// [phone] - Customer phone number (any format, will be normalized)
  /// [message] - Pre-filled text message
  /// [pdfFilePath] - Absolute path to the PDF file (used only in generic share fallback)
  ///
  /// Uses url_launcher to open WhatsApp directly to the customer's chat with
  /// the pre-filled text message (including the bill link).
  static Future<bool> shareInvoice({
    required String phone,
    required String message,
    required String pdfFilePath,
  }) async {
    final formattedPhone = formatPhoneNumber(phone);
    final encodedMessage = Uri.encodeComponent(message);

    // Primary: Try the native WhatsApp scheme directly
    final whatsappUri = Uri.parse('whatsapp://send?phone=$formattedPhone&text=$encodedMessage');
    
    try {
      if (await canLaunchUrl(whatsappUri)) {
        await launchUrl(whatsappUri, mode: LaunchMode.externalApplication);
        return true;
      }
    } catch (_) {
      // Ignore and proceed to fallback
    }

    // Fallback 1: Try the universal wa.me link
    final webUri = Uri.parse('https://wa.me/$formattedPhone?text=$encodedMessage');
    
    try {
      if (await canLaunchUrl(webUri)) {
        await launchUrl(webUri, mode: LaunchMode.externalApplication);
        return true;
      }
    } catch (_) {
      // Ignore and proceed to generic fallback
    }

    // Fallback 2: Generic share sheet (includes the PDF file)
    await _fallbackShare(message, pdfFilePath);
    return false;
  }

  /// Fallback: use the generic share sheet (share_plus)
  static Future<void> _fallbackShare(String message, String pdfFilePath) async {
    if (pdfFilePath.isNotEmpty) {
      await SharePlus.instance.share(
        ShareParams(
          files: [XFile(pdfFilePath)],
          text: message,
        ),
      );
    }
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
    buffer.writeln('bills.billpush.com/v/$billingId');
    buffer.writeln();
    buffer.writeln('_Powered by BillPush_');
    return buffer.toString();
  }
}
