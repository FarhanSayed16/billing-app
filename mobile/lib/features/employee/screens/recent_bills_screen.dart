import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../config/theme.dart';
import '../../../providers/api_provider.dart';
import '../../../core/utils/pdf_generator.dart';

class RecentBillsScreen extends ConsumerStatefulWidget {
  const RecentBillsScreen({super.key});

  @override
  ConsumerState<RecentBillsScreen> createState() => _RecentBillsScreenState();
}

class _RecentBillsScreenState extends ConsumerState<RecentBillsScreen> {
  List<dynamic> _invoices = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchRecentBills();
  }

  Future<void> _fetchRecentBills() async {
    try {
      final dio = ref.read(dioProvider);
      
      // employee role backend logic automatically filters by employee_id when role=EMPLOYEE
      final res = await dio.get('/invoices', queryParameters: {
        'limit': 50,
      });
      
      if (mounted) setState(() => _invoices = res.data['data']);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to load recent bills')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Recent Bills'),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _fetchRecentBills,
            child: _invoices.isEmpty 
              ? ListView(children: const [SizedBox(height: 100), Center(child: Text('No bills today.'))])
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _invoices.length,
                  itemBuilder: (context, index) {
                    final inv = _invoices[index];
                    final date = DateTime.parse(inv['created_at']);
                    final isVoid = inv['status'] == 'FULLY_REFUNDED';
                    
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: isVoid ? AppTheme.errorColor.withValues(alpha: 0.1) : AppTheme.successColor.withValues(alpha: 0.1),
                          child: Icon(
                            isVoid ? Icons.cancel_outlined : Icons.receipt_outlined,
                            color: isVoid ? AppTheme.errorColor : AppTheme.successColor,
                          )
                        ),
                        title: Text('${inv['customer_name']}', style: TextStyle(
                           fontWeight: FontWeight.bold,
                           decoration: isVoid ? TextDecoration.lineThrough : null,
                        )),
                        subtitle: Text('${inv['invoice_number']} • ${DateFormat('h:mm a').format(date)}'),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('₹${inv['grand_total']}', style: TextStyle(
                               fontWeight: FontWeight.bold, 
                               fontSize: 16,
                               color: isVoid ? AppTheme.errorColor : AppTheme.textPrimaryColor
                            )),
                            const SizedBox(width: 8),
                            if (!isVoid)
                              IconButton(
                                icon: const Icon(Icons.share, color: AppTheme.primaryColor),
                                onPressed: () async {
                                  try {
                                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Generating PDF...')));
                                    final dio = ref.read(dioProvider);
                                    // Fetch full invoice details
                                    final invRes = await dio.get('/invoices/${inv['id']}');
                                    final invoiceData = invRes.data;
                                    final storeData = invoiceData['store'] ?? {};
                                    // Generate PDF
                                    final pdfFile = await InvoicePdfGenerator.generateInvoicePdf(invoiceData, storeData);
                                    final text = "Thank you for shopping at ${storeData['name'] ?? 'our store'}!\n"
                                        "Your bill: \u20b9${inv['grand_total']}\n"
                                        "View invoice: bills.billpush.com/v/${inv['billing_id'] ?? invoiceData['billing_id']}";
                                    await SharePlus.instance.share(ShareParams(files: [XFile(pdfFile.path)], text: text));
                                  } catch (e) {
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to re-share')));
                                    }
                                  }
                                },
                              ),
                          ],
                        ),
                        onTap: () {
                          // View invoice detail using the identical store_admin detail screen component
                          // which we'll configure in GoRouter
                          context.push('/employee/pos/invoice', extra: inv['id']);
                        },
                      ),
                    );
                  },
                ),
          )
    );
  }
}
