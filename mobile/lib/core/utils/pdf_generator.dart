import 'dart:io';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';

class InvoicePdfGenerator {
  static Future<File> generateInvoicePdf(Map<String, dynamic> invoiceData, Map<String, dynamic> storeData) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // Header
              pw.Center(
                child: pw.Text(
                  storeData['name'] ?? 'Your Store',
                  style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold),
                ),
              ),
              pw.Center(child: pw.Text(storeData['address'] ?? '')),
              pw.Center(child: pw.Text('${storeData['city'] ?? ''}')),
              pw.Center(child: pw.Text('Ph: ${storeData['phone'] ?? ''}')),
              if (storeData['gst_number'] != null && storeData['gst_number'].toString().isNotEmpty)
                pw.Center(child: pw.Text('GSTIN: ${storeData['gst_number']}')),
              
              pw.Divider(thickness: 1, margin: const pw.EdgeInsets.symmetric(vertical: 10)),
              
              // Invoice Info
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('Invoice #: ${invoiceData['invoice_number']}'),
                      pw.Text('Billing ID: ${invoiceData['billing_id']}'),
                      pw.Text('Date: ${DateTime.now().toString().split('.')[0]}'),
                    ]
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text('Customer: ${invoiceData['customer_name'] ?? 'Guest'}'),
                      pw.Text('Phone: ${invoiceData['customer_phone'] ?? ''}'),
                    ]
                  )
                ]
              ),
              
              pw.Divider(thickness: 1, margin: const pw.EdgeInsets.symmetric(vertical: 10)),
              
              // Items Table Header
              pw.Row(
                children: [
                  pw.Expanded(flex: 3, child: pw.Text('Item', style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
                  pw.Expanded(flex: 1, child: pw.Text('Qty', textAlign: pw.TextAlign.center, style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
                  pw.Expanded(flex: 1, child: pw.Text('Price', textAlign: pw.TextAlign.right, style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
                  pw.Expanded(flex: 2, child: pw.Text('Total', textAlign: pw.TextAlign.right, style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
                ],
              ),
              pw.Divider(thickness: 1),

              // Items
              ...(invoiceData['items'] as List<dynamic>).map((item) {
                return pw.Padding(
                  padding: const pw.EdgeInsets.symmetric(vertical: 4),
                  child: pw.Row(
                    children: [
                      pw.Expanded(flex: 3, child: pw.Text(item['name'])),
                      pw.Expanded(flex: 1, child: pw.Text('${item['quantity']}x', textAlign: pw.TextAlign.center)),
                      pw.Expanded(flex: 1, child: pw.Text('Rs.${item['unit_price']}', textAlign: pw.TextAlign.right)),
                      pw.Expanded(flex: 2, child: pw.Text('Rs.${item['unit_price'] * item['quantity']}', textAlign: pw.TextAlign.right)),
                    ],
                  )
                );
              }).toList(),
              
              pw.Divider(thickness: 1, margin: const pw.EdgeInsets.symmetric(vertical: 10)),
              
              // Totals
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.end,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text('Subtotal: Rs. ${invoiceData['subtotal']}'),
                      if (invoiceData['tax_amount'] > 0)
                        pw.Text('Tax: Rs. ${invoiceData['tax_amount']}'),
                      if (invoiceData['discount_amount'] > 0)
                        pw.Text('Discount: -Rs. ${invoiceData['discount_amount']}'),
                      if (invoiceData['loyalty_discount'] > 0)
                        pw.Text('Loyalty: -Rs. ${invoiceData['loyalty_discount']}'),
                      pw.SizedBox(height: 10),
                      pw.BarcodeWidget(
                        barcode: pw.Barcode.qrCode(),
                        data: invoiceData['billing_id'],
                        height: 80,
                        width: 80,
                      ),
                      pw.SizedBox(height: 10),
                      pw.Text('GRAND TOTAL: Rs. ${invoiceData['grand_total']}', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
                    ]
                  )
                ]
              ),
              
              pw.Spacer(),
              pw.Center(
                child: pw.Text('Powered by BillPush | bills.billpush.com/v/${invoiceData['billing_id']}', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey)),
              )
            ],
          );
        },
      ),
    );

    // Save to temp dir
    final output = await getTemporaryDirectory();
    final file = File('${output.path}/invoice_${invoiceData['invoice_number']}.pdf');
    await file.writeAsBytes(await pdf.save());
    return file;
  }
}
