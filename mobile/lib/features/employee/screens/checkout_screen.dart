import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../widgets/share_invoice_sheet.dart';
import '../../../config/theme.dart';
import '../../../providers/cart_provider.dart';
import '../../../providers/api_provider.dart';
import '../../../core/utils/pdf_generator.dart';
import 'package:dio/dio.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _manualDiscountCtrl = TextEditingController();
  bool _isProcessing = false;
  bool _useLoyalty = false;

  @override
  void dispose() {
    _manualDiscountCtrl.dispose();
    super.dispose();
  }

  void _applyManualDiscount(String val) {
    if (val.isEmpty) {
      ref.read(cartProvider.notifier).setDiscount(0);
      return;
    }
    final amount = num.tryParse(val);
    if (amount != null) {
      ref.read(cartProvider.notifier).setDiscount(amount);
    }
  }

  void _toggleLoyalty(bool value, num pointsCount) {
    setState(() => _useLoyalty = value);
    if (value) {
      ref.read(cartProvider.notifier).setLoyaltyDiscount(pointsCount * 1); // 1 point = 1 rupee for MVP mapping
    } else {
      ref.read(cartProvider.notifier).setLoyaltyDiscount(0);
    }
  }

  Future<void> _confirmAndShare() async {
    setState(() => _isProcessing = true);
    try {
      final dio = ref.read(dioProvider);
      final cart = ref.read(cartProvider);

      // We need to fetch the current store data for the PDF
      final meRes = await dio.get('/auth/me');
      final storeId = meRes.data['store_id'];
      final storeRes = await dio.get('/stores/$storeId');
      final storeData = storeRes.data;

      // 1. Post to create invoice
      final invoicePayload = {
        if (cart.customer?.id != null) 'customer_id': cart.customer!.id,
        'customer_phone': cart.customer?.phone,
        'customer_name': cart.customer?.name,
        'items': cart.items.map((i) => ({
          'name': i.name,
          'quantity': i.quantity,
          'unit_price': i.unitPrice,
          'tax_rate': i.taxRate,
        })).toList(),
        'discount_amount': cart.discountAmount,
        'loyalty_points_redeemed': _useLoyalty ? cart.customer?.loyaltyPoints : 0,
        'tax_amount': cart.taxAmount,
        'subtotal': cart.subtotal,
        'grand_total': cart.grandTotal,
      };

      final invRes = await dio.post('/invoices', data: invoicePayload);
      final invoiceData = invRes.data;

      // Ensure mock structures map for local generation visually:
      final Map<String, dynamic> formattedInvoiceData = {
        ...Map<String, dynamic>.from(invoiceData),
        'customer_name': cart.customer?.name,
        'customer_phone': cart.customer?.phone,
        'items': cart.items.map((i) => ({'name': i.name, 'quantity': i.quantity, 'unit_price': i.unitPrice})).toList()
      };

      // 2. Output PDF Local
      final pdfFile = await InvoicePdfGenerator.generateInvoicePdf(formattedInvoiceData, Map<String, dynamic>.from(storeData));

      // 3. Show share options bottom sheet (WhatsApp direct + generic share)
      if (mounted) {
        await showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => ShareInvoiceSheet(
            customerPhone: cart.customer?.phone,
            storeName: storeData['name'] ?? 'Store',
            grandTotal: cart.grandTotal,
            billingId: invoiceData['billing_id'] ?? '',
            invoiceNumber: invoiceData['invoice_number'],
            pdfFile: pdfFile,
          ),
        );
      }

      // 4. Mark shared successfully if API supports
      try {
        await dio.patch('/invoices/${invoiceData['id']}/share');
      } catch (_) {}

      if (mounted) {
        // Navigate to success
        ref.read(cartProvider.notifier).clearCart();
        context.pushReplacement('/employee/pos/success', extra: invoiceData);
      }
    } on DioException catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to process bill.')));
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);

    return Scaffold(
      appBar: const BillPushAppBar(title: 'Review & Confirm'),
      body: LoadingOverlay(
        isLoading: _isProcessing,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Customer: ${cart.customer?.name ?? 'Guest'}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text('Phone: ${cart.customer?.phone ?? ''}', style: const TextStyle(color: Colors.grey)),
              const SizedBox(height: 24),
              
              const Text('Items', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const Divider(),
              ...cart.items.map((i) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Expanded(child: Text('${i.name} (${i.quantity}x)')),
                    Text('₹${i.lineTotal}'),
                  ],
                ),
              )),
              const Divider(thickness: 2),
              
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Subtotal'),
                  Text('₹${cart.subtotal}'),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('GST / Tax Amount'),
                  Text('₹${cart.taxAmount}'),
                ],
              ),
              
              const SizedBox(height: 24),
              // Discounts
              const Text('Discounts', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              TextField(
                controller: _manualDiscountCtrl,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  labelText: 'Manual Discount (₹)',
                  prefixIcon: const Icon(Icons.money_off),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onChanged: _applyManualDiscount,
              ),

              if (cart.customer != null && cart.customer!.loyaltyPoints > 0) ...[
                const SizedBox(height: 16),
                SwitchListTile(
                  title: Text('Redeem Loyalty (${cart.customer!.loyaltyPoints} pts = ₹${cart.customer!.loyaltyPoints})'),
                  value: _useLoyalty,
                  onChanged: (v) => _toggleLoyalty(v, cart.customer!.loyaltyPoints),
                  activeThumbColor: AppTheme.primaryColor,
                  contentPadding: EdgeInsets.zero,
                ),
              ],
              
              const SizedBox(height: 32),
              Card(
                color: AppTheme.successColor.withValues(alpha: 0.1),
                elevation: 0,
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('GRAND TOTAL', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.successColor)),
                      Text('₹${cart.grandTotal}', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppTheme.successColor)),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 48),
              SizedBox(
                height: 60,
                child: ElevatedButton.icon(
                  onPressed: cart.items.isEmpty ? null : _confirmAndShare,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.successColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  icon: const Icon(Icons.share, size: 28, color: Colors.white),
                  label: const Text('CONFIRM & SHARE', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
