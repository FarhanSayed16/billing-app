import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../config/theme.dart';
import '../../../providers/api_provider.dart';

class ProcessReturnScreen extends ConsumerStatefulWidget {
  final String billingId;
  const ProcessReturnScreen({super.key, required this.billingId});

  @override
  ConsumerState<ProcessReturnScreen> createState() => _ProcessReturnScreenState();
}

class _ProcessReturnScreenState extends ConsumerState<ProcessReturnScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _invoice;
  final Map<String, int> _returnQuantities = {};
  final _reasonCtrl = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _fetchInvoice();
  }

  @override
  void dispose() {
    _reasonCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchInvoice() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/invoices/billing/${widget.billingId}');
      setState(() {
        _invoice = res.data;
        _isLoading = false;
        
        for (var item in _invoice!['items']) {
          _returnQuantities[item['id']] = 0;
        }
      });
    } on DioException catch (_) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to load invoice')));
      }
    }
  }

  void _updateQuantity(String itemId, int delta, int maxReturnable) {
    setState(() {
      int current = _returnQuantities[itemId] ?? 0;
      int newVal = current + delta;
      if (newVal >= 0 && newVal <= maxReturnable) {
        _returnQuantities[itemId] = newVal;
      }
    });
  }

  Future<void> _submitReturn() async {
    final itemsToReturn = _returnQuantities.entries
        .where((e) => e.value > 0)
        .map((e) => {'invoice_item_id': e.key, 'quantity': e.value})
        .toList();

    if (itemsToReturn.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Select at least one item to return')));
      return;
    }

    setState(() => _isSubmitting = true);
    
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.post('/returns', data: {
        'billing_id': widget.billingId,
        'reason': _reasonCtrl.text.trim(),
        'items': itemsToReturn,
      });

      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            title: const Text('Return Submitted'),
            content: Text(res.data['message'] ?? 'Return processed.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  context.go('/employee/pos');
                },
                child: const Text('OK'),
              )
            ],
          ),
        );
      }
    } on DioException catch (e) {
      if (mounted) {
        final msg = e.response?.data?['message'] ?? 'Submission failed';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        appBar: BillPushAppBar(title: 'Process Return'),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_invoice == null) {
      return Scaffold(
        appBar: const BillPushAppBar(title: 'Process Return'),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Invoice not found.'),
              ElevatedButton(onPressed: () => context.pop(), child: const Text('Go Back'))
            ],
          ),
        ),
      );
    }

    final items = _invoice!['items'] as List<dynamic>;

    // Calculate dynamic refund amount text visually
    double dynamicRefund = 0;
    for (var item in items) {
      int returningQty = _returnQuantities[item['id']] ?? 0;
      double proportionalRefund = double.parse(item['total'].toString()) / item['quantity'];
      dynamicRefund += (proportionalRefund * returningQty);
    }

    return Scaffold(
      appBar: BillPushAppBar(title: 'Return: ${widget.billingId}'),
      body: LoadingOverlay(
        isLoading: _isSubmitting,
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              color: AppTheme.primaryColor.withValues(alpha: 0.05),
              child: Row(
                children: [
                  const Icon(Icons.receipt_long, color: AppTheme.primaryColor),
                  const SizedBox(width: 8),
                  Text('Customer: ${_invoice!['customer']?['name'] ?? 'Guest'}', style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: items.length,
                itemBuilder: (ctx, idx) {
                  final item = items[idx];
                  final returned = item['returned_quantity'] ?? 0;
                  final available = item['quantity'] - returned;
                  final currentRet = _returnQuantities[item['id']] ?? 0;

                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(item['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                              Text('₹${item['unit_price']}', style: const TextStyle(color: Colors.grey)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('Available to return: $available / ${item['quantity']}', style: TextStyle(color: available == 0 ? Colors.red : Colors.black87)),
                          if (available > 0)
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove_circle_outline, color: AppTheme.errorColor),
                                  onPressed: () => _updateQuantity(item['id'], -1, available),
                                ),
                                Text('$currentRet', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                IconButton(
                                  icon: const Icon(Icons.add_circle_outline, color: AppTheme.successColor),
                                  onPressed: () => _updateQuantity(item['id'], 1, available),
                                ),
                              ],
                            )
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -5))],
              ),
              child: SafeArea(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    BillPushTextField(
                      label: 'Reason for Return (Optional)',
                      controller: _reasonCtrl,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Est. Refund:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        Text('₹${dynamicRefund.toStringAsFixed(2)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.successColor)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    BillPushButton(
                      text: 'Submit Return Request',
                      onPressed: dynamicRefund > 0 ? () => _submitReturn() : null,
                    )
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
