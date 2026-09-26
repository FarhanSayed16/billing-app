import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../widgets/share_invoice_sheet.dart';
import '../../../config/theme.dart';
import '../../../providers/cart_provider.dart';
import '../../../providers/api_provider.dart';
import '../../../core/utils/pdf_generator.dart';
import '../../../core/storage/hive_models.dart';
import '../../../core/network/sync_service.dart';
import '../../../core/utils/error_message.dart';
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
  int _loyaltyMinRedemption = 100;
  num _redeemablePoints = 0;

  @override
  void initState() {
    super.initState();
    _loadLoyaltyConfig();
  }

  Future<void> _loadLoyaltyConfig() async {
    try {
      final dio = ref.read(dioProvider);
      final meRes = await dio.get('/auth/me');
      final storeId = meRes.data['store_id'];
      if (storeId == null) return;
      final storeRes = await dio.get('/stores/$storeId');
      final brandMin = storeRes.data['brand']?['loyalty_min_redemption'];
      if (brandMin is num && mounted) {
        setState(() => _loyaltyMinRedemption = brandMin.toInt());
      }
    } catch (_) {}
  }

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
      final cart = ref.read(cartProvider);
      final maxDiscount = cart.subtotal + cart.taxAmount - (_useLoyalty ? _redeemablePoints : 0);
      final capped = amount < 0 ? 0 : (amount > maxDiscount && maxDiscount > 0 ? maxDiscount : amount);
      ref.read(cartProvider.notifier).setDiscount(capped);
    }
  }

  void _toggleLoyalty(bool value) {
    final cart = ref.read(cartProvider);
    final points = cart.customer?.loyaltyPoints ?? 0;
    final maxByTotal = (cart.subtotal + cart.taxAmount - cart.discountAmount).floor();
    final redeemable = points < maxByTotal ? points : maxByTotal;

    if (value) {
      if (redeemable < _loyaltyMinRedemption) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              redeemable <= 0
                  ? 'Not enough cart value to redeem loyalty points'
                  : 'Minimum $_loyaltyMinRedemption points required to redeem (available: $redeemable)',
            ),
          ),
        );
        return;
      }
      setState(() {
        _useLoyalty = true;
        _redeemablePoints = redeemable;
      });
      ref.read(cartProvider.notifier).setLoyaltyDiscount(redeemable);
    } else {
      setState(() {
        _useLoyalty = false;
        _redeemablePoints = 0;
      });
      ref.read(cartProvider.notifier).setLoyaltyDiscount(0);
    }
  }

  Future<void> _confirmAndShare() async {
    setState(() => _isProcessing = true);
    try {
      final dio = ref.read(dioProvider);
      final cart = ref.read(cartProvider);

      final meRes = await dio.get('/auth/me');
      final storeId = meRes.data['store_id'];
      final storeRes = await dio.get('/stores/$storeId');
      final storeData = storeRes.data;
      final brandMin = storeData['brand']?['loyalty_min_redemption'];
      if (brandMin is num) {
        _loyaltyMinRedemption = brandMin.toInt();
      }

      num loyaltyPointsRedeemed = 0;
      if (_useLoyalty && cart.customer != null) {
        final maxByTotal = (cart.subtotal + cart.taxAmount - cart.discountAmount).floor();
        final points = cart.customer!.loyaltyPoints;
        loyaltyPointsRedeemed = points < maxByTotal ? points : maxByTotal;
        if (loyaltyPointsRedeemed < _loyaltyMinRedemption) {
          throw DioException(
            requestOptions: RequestOptions(path: '/invoices'),
            error: 'Minimum $_loyaltyMinRedemption loyalty points required',
          );
        }
      }

      final invoicePayload = {
        if (cart.customer?.id != null) 'customer_id': cart.customer!.id,
        'customer_phone': cart.customer?.phone,
        'customer_name': cart.customer?.name,
        'items': cart.items.map((i) => ({
          if (i.productId != null) 'product_id': i.productId,
          'name': i.name,
          'quantity': i.quantity,
          'unit_price': i.unitPrice,
          'tax_rate': i.taxRate,
        })).toList(),
        'discount_amount': cart.discountAmount,
        'loyalty_points_redeemed': loyaltyPointsRedeemed,
        'tax_amount': cart.taxAmount,
        'subtotal': cart.subtotal,
        'grand_total': cart.grandTotal,
      };

      final invRes = await dio.post('/invoices', data: invoicePayload);
      final invoiceData = invRes.data;

      final Map<String, dynamic> formattedInvoiceData = {
        ...Map<String, dynamic>.from(invoiceData),
        'customer_name': cart.customer?.name,
        'customer_phone': cart.customer?.phone,
        'items': cart.items.map((i) => ({'name': i.name, 'quantity': i.quantity, 'unit_price': i.unitPrice})).toList()
      };

      final pdfFile = await InvoicePdfGenerator.generateInvoicePdf(formattedInvoiceData, Map<String, dynamic>.from(storeData));

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

      try {
        await dio.patch('/invoices/${invoiceData['id']}/share');
      } catch (_) {}

      if (mounted) {
        ref.read(cartProvider.notifier).clearCart();
        context.pushReplacement('/employee/pos/success', extra: invoiceData);
      }
    } on DioException catch (e) {
      final isOffline = e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          (e.error?.toString().contains('No internet') ?? false);

      if (isOffline) {
        try {
          final cart = ref.read(cartProvider);
          final billingId = const Uuid().v4().substring(0, 8).toUpperCase();
          num loyaltyPointsRedeemed = 0;
          if (_useLoyalty && cart.customer != null) {
            final maxByTotal = (cart.subtotal + cart.taxAmount - cart.discountAmount).floor();
            final points = cart.customer!.loyaltyPoints;
            loyaltyPointsRedeemed = points < maxByTotal ? points : maxByTotal;
          }

          await SyncService.enqueueOfflineInvoice(
            OfflineInvoice(
              billingId: billingId,
              customerId: cart.customer?.id,
              customerPhone: cart.customer?.phone,
              customerName: cart.customer?.name,
              items: cart.items
                  .map((i) => OfflineInvoiceItem(
                        productId: i.productId,
                        name: i.name,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                        taxRate: i.taxRate,
                      ))
                  .toList(),
              discountAmount: cart.discountAmount,
              loyaltyPointsRedeemed: loyaltyPointsRedeemed,
              taxAmount: cart.taxAmount,
              subtotal: cart.subtotal,
              grandTotal: cart.grandTotal,
              createdAt: DateTime.now(),
            ),
          );

          if (mounted) {
            ref.read(cartProvider.notifier).clearCart();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Saved offline. Will sync when back online.')),
            );
            context.pushReplacement('/employee/pos/success', extra: {
              'billing_id': billingId,
              'grand_total': cart.grandTotal,
              'offline': true,
            });
          }
          return;
        } catch (_) {
          // fall through to generic error
        }
      }

      if (mounted) {
        final msg = apiErrorMessage(e, 'Failed to process bill.');
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final canShowLoyalty = cart.customer != null && cart.customer!.loyaltyPoints > 0;
    final maxByTotal = (cart.subtotal + cart.taxAmount - cart.discountAmount).floor();
    final previewRedeemable = canShowLoyalty
        ? (cart.customer!.loyaltyPoints < maxByTotal ? cart.customer!.loyaltyPoints : maxByTotal)
        : 0;

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
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(child: Text('${i.name} x${i.quantity}')),
                    Text('₹${i.lineTotal}'),
                  ],
                ),
              )),
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
              if (canShowLoyalty) ...[
                const SizedBox(height: 16),
                SwitchListTile(
                  title: Text(
                    previewRedeemable < _loyaltyMinRedemption
                        ? 'Loyalty (${cart.customer!.loyaltyPoints} pts) — need min $_loyaltyMinRedemption'
                        : 'Redeem Loyalty ($previewRedeemable pts = ₹$previewRedeemable)',
                  ),
                  subtitle: Text('Min redemption: $_loyaltyMinRedemption pts'),
                  value: _useLoyalty,
                  onChanged: previewRedeemable < _loyaltyMinRedemption && !_useLoyalty
                      ? null
                      : (v) => _toggleLoyalty(v),
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
