import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
// import 'package:share_plus/share_plus.dart'; // To be added in Phase 1I if needed, or 1J for sharing.
// Currently we just fetch the URL for sharing.
import '../../../widgets/custom_widgets.dart';
import '../../../providers/api_provider.dart';
import '../../../config/theme.dart';

class InvoiceDetailScreen extends ConsumerStatefulWidget {
  final String invoiceId;
  const InvoiceDetailScreen({Key? key, required this.invoiceId}) : super(key: key);

  @override
  ConsumerState<InvoiceDetailScreen> createState() => _InvoiceDetailScreenState();
}

class _InvoiceDetailScreenState extends ConsumerState<InvoiceDetailScreen> {
  Map<String, dynamic>? _invoice;
  bool _isLoading = true;
  bool _isVoiding = false;

  @override
  void initState() {
    super.initState();
    _fetchInvoice();
  }

  Future<void> _fetchInvoice() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/invoices/${widget.invoiceId}');
      setState(() => _invoice = res.data);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load invoice details'), backgroundColor: AppTheme.errorColor),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _voidInvoice() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm Void'),
        content: const Text('Are you sure you want to void this invoice? This will refund points and update stats.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true), 
            style: TextButton.styleFrom(foregroundColor: AppTheme.errorColor),
            child: const Text('Void Invoice')
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isVoiding = true);
    try {
      final dio = ref.read(dioProvider);
      await dio.patch('/invoices/${widget.invoiceId}/void');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invoice voided successfully'), backgroundColor: AppTheme.successColor));
        _fetchInvoice();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to void invoice'), backgroundColor: AppTheme.errorColor));
      }
    } finally {
      if (mounted) setState(() => _isVoiding = false);
    }
  }

  Future<void> _reShareInvoice() async {
    // Generate PDF and get link to share
    setState(() => _isVoiding = true); // reusing loading state for now
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/invoices/${widget.invoiceId}/pdf');
      final url = res.data['url'];
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('PDF Ready: $url'), backgroundColor: AppTheme.successColor));
        // Share.share('Here is your invoice: $url');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to generate PDF'), backgroundColor: AppTheme.errorColor));
      }
    } finally {
      if (mounted) setState(() => _isVoiding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _invoice == null) {
      return const Scaffold(appBar: BillPushAppBar(title: 'Invoice Details'), body: Center(child: CircularProgressIndicator()));
    }
    if (_invoice == null) {
      return const Scaffold(appBar: BillPushAppBar(title: 'Error'), body: Center(child: Text('Not found')));
    }

    final inv = _invoice!;
    final isVoid = inv['status'] == 'FULLY_REFUNDED';
    final date = DateTime.parse(inv['created_at']);
    final items = inv['items'] as List;

    return Scaffold(
      appBar: const BillPushAppBar(title: 'Invoice Details'),
      body: LoadingOverlay(
        isLoading: _isVoiding,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (isVoid)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 24),
                  decoration: BoxDecoration(color: AppTheme.errorColor.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.warning_amber_rounded, color: AppTheme.errorColor),
                      SizedBox(width: 8),
                      Text('THIS INVOICE HAS BEEN VOIDED', style: TextStyle(color: AppTheme.errorColor, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              
              Text('Invoice: ${inv['invoice_number']}', style: Theme.of(context).textTheme.titleLarge),
              Text('Billing ID: ${inv['billing_id']}', style: const TextStyle(color: Colors.grey)),
              const SizedBox(height: 16),
              
              Card(
                elevation: 0,
                color: Colors.grey.shade100,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _DetailRow(label: 'Date', value: DateFormat('MMM d, y, h:mm a').format(date)),
                      _DetailRow(label: 'Customer', value: inv['customer']?['name'] ?? 'Guest'),
                      _DetailRow(label: 'Phone', value: inv['customer']?['phone'] ?? 'N/A'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              const Text('Items', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const Divider(),
              ...items.map((it) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  children: [
                    Expanded(flex: 3, child: Text(it['name'], style: const TextStyle(fontWeight: FontWeight.w500))),
                    Expanded(flex: 1, child: Text('${it['quantity']}x', textAlign: TextAlign.center)),
                    Expanded(flex: 2, child: Text('₹${it['total']}', textAlign: TextAlign.right)),
                  ],
                ),
              )).toList(),
              const Divider(thickness: 2),
              
              const SizedBox(height: 8),
              _TotalRow(label: 'Subtotal', value: inv['subtotal'].toString()),
              _TotalRow(label: 'Tax Amount', value: inv['tax_amount'].toString()),
              if (inv['discount_amount'] > 0)
                _TotalRow(label: 'Discount', value: '-${inv['discount_amount']}'),
              if (inv['loyalty_discount'] > 0)
                _TotalRow(label: 'Loyalty Discount', value: '-${inv['loyalty_discount']}'),
              
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('GRAND TOTAL', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  Text('₹${inv['grand_total']}', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: isVoid ? AppTheme.errorColor : AppTheme.primaryColor)),
                ],
              ),
              
              const SizedBox(height: 32),
              Row(
                children: [
                  if (!isVoid)
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.cancel_outlined),
                        label: const Text('Void'),
                        style: OutlinedButton.styleFrom(foregroundColor: AppTheme.errorColor, padding: const EdgeInsets.symmetric(vertical: 16)),
                        onPressed: _voidInvoice,
                      ),
                    ),
                  if (!isVoid) const SizedBox(width: 16),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.share),
                      label: const Text('Share Invoice'),
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                      onPressed: _reShareInvoice,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _TotalRow extends StatelessWidget {
  final String label;
  final String value;
  const _TotalRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text('₹$value'),
        ],
      ),
    );
  }
}
