import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../config/theme.dart';
import '../../../providers/api_provider.dart';

class PendingReturnsScreen extends ConsumerStatefulWidget {
  const PendingReturnsScreen({super.key});

  @override
  ConsumerState<PendingReturnsScreen> createState() => _PendingReturnsScreenState();
}

class _PendingReturnsScreenState extends ConsumerState<PendingReturnsScreen> {
  bool _isLoading = true;
  List<dynamic> _returns = [];

  @override
  void initState() {
    super.initState();
    _fetchPendingReturns();
  }

  Future<void> _fetchPendingReturns() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/returns/pending');
      if (mounted) {
        setState(() {
          _returns = res.data ?? [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _actionReturn(String id, bool approve) async {
    try {
      final dio = ref.read(dioProvider);
      final endpoint = approve ? '/returns/$id/approve' : '/returns/$id/reject';
      await dio.patch(endpoint);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(approve ? 'Return Approved' : 'Return Rejected')));
        _fetchPendingReturns(); // refresh list
      }
    } on DioException catch (e) {
      if (mounted) {
        final msg = e.response?.data?['message'] ?? 'Action failed';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Pending Returns (Approvals)'),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _returns.isEmpty
              ? const Center(child: Text('No pending returns awaiting approval.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _returns.length,
                  itemBuilder: (ctx, idx) {
                    final returnReq = _returns[idx];
                    final invoice = returnReq['invoice'] ?? {};
                    final customer = invoice['customer'] ?? {};
                    final items = returnReq['items'] as List<dynamic>;

                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Bill ID: ${invoice['billing_id']}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                                Text('₹${returnReq['refund_amount']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.errorColor)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text('Customer: ${customer['name'] ?? 'Guest'} (${customer['phone'] ?? 'N/A'})'),
                            Text('Processed by: ${returnReq['employee']?['name'] ?? 'Unknown'}'),
                            if (returnReq['reason'] != null && returnReq['reason'].isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Text('Reason: ${returnReq['reason']}', style: const TextStyle(fontStyle: FontStyle.italic)),
                              ),
                            const Divider(height: 24),
                            const Text('Items to Return:', style: TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            ...items.map((item) {
                              final invItem = item['invoice_item'] ?? {};
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 2),
                                child: Text('• ${invItem['name']} (x${item['quantity']}) - ₹${invItem['unit_price']} ea'),
                              );
                            }),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                OutlinedButton(
                                  onPressed: () => _actionReturn(returnReq['id'], false),
                                  style: OutlinedButton.styleFrom(foregroundColor: AppTheme.errorColor, side: const BorderSide(color: AppTheme.errorColor)),
                                  child: const Text('Reject'),
                                ),
                                const SizedBox(width: 16),
                                ElevatedButton(
                                  onPressed: () => _actionReturn(returnReq['id'], true),
                                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.successColor),
                                  child: const Text('Approve'),
                                ),
                              ],
                            )
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
