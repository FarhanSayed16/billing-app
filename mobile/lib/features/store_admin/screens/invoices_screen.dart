import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../providers/api_provider.dart';
import '../../../config/theme.dart';
import 'invoice_detail_screen.dart';

class InvoicesScreen extends ConsumerStatefulWidget {
  const InvoicesScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends ConsumerState<InvoicesScreen> {
  List<dynamic> _invoices = [];
  bool _isLoading = true;
  String _filter = 'Today'; // Today, Week, Month

  @override
  void initState() {
    super.initState();
    _fetchInvoices();
  }

  Future<void> _fetchInvoices() async {
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioProvider);
      
      final now = DateTime.now();
      late DateTime startTime;
      
      if (_filter == 'Today') {
        startTime = DateTime(now.year, now.month, now.day);
      } else if (_filter == 'Week') {
        startTime = now.subtract(Duration(days: now.weekday - 1));
        startTime = DateTime(startTime.year, startTime.month, startTime.day);
      } else {
        startTime = DateTime(now.year, now.month, 1);
      }

      final res = await dio.get('/invoices', queryParameters: {
        'date_from': startTime.toIso8601String(),
        'date_to': now.toIso8601String(),
        'limit': 100,
      });
      
      setState(() => _invoices = res.data['data']);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load invoices'), backgroundColor: AppTheme.errorColor),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Invoices', showBackButton: false),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'Today', label: Text('Today')),
                ButtonSegment(value: 'Week', label: Text('This Week')),
                ButtonSegment(value: 'Month', label: Text('This Month')),
              ],
              selected: {_filter},
              onSelectionChanged: (Set<String> newSelection) {
                setState(() => _filter = newSelection.first);
                _fetchInvoices();
              },
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _fetchInvoices,
                    child: _invoices.isEmpty
                        ? ListView(children: const [SizedBox(height: 100), Center(child: Text('No invoices found'))])
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _invoices.length,
                            itemBuilder: (context, index) {
                              final inv = _invoices[index];
                              final isVoid = inv['status'] == 'FULLY_REFUNDED';
                              final date = DateTime.parse(inv['created_at']);
                              
                              return Card(
                                margin: const EdgeInsets.only(bottom: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                child: ListTile(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => InvoiceDetailScreen(invoiceId: inv['id']))
                                    ).then((_) => _fetchInvoices());
                                  },
                                  leading: CircleAvatar(
                                    backgroundColor: isVoid ? AppTheme.errorColor.withOpacity(0.1) : AppTheme.successColor.withOpacity(0.1),
                                    child: Icon(
                                      isVoid ? Icons.cancel_outlined : Icons.receipt_outlined, 
                                      color: isVoid ? AppTheme.errorColor : AppTheme.successColor
                                    ),
                                  ),
                                  title: Text(inv['invoice_number'], style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    decoration: isVoid ? TextDecoration.lineThrough : null,
                                  )),
                                  subtitle: Text('${inv['customer_name']} • ${DateFormat('MMM d, h:mm a').format(date)}'),
                                  trailing: Text('₹${inv['grand_total']}', style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: isVoid ? AppTheme.errorColor : AppTheme.textPrimaryColor,
                                  )),
                                ),
                              );
                            },
                          ),
                  ),
          )
        ],
      ),
    );
  }
}
