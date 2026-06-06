import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../config/theme.dart';
import '../../../providers/api_provider.dart';
import 'package:intl/intl.dart';

class CustomerLedgerScreen extends ConsumerStatefulWidget {
  const CustomerLedgerScreen({super.key});

  @override
  ConsumerState<CustomerLedgerScreen> createState() => _CustomerLedgerScreenState();
}

class _CustomerLedgerScreenState extends ConsumerState<CustomerLedgerScreen> {
  final _phoneCtrl = TextEditingController();
  bool _isLoading = false;
  Map<String, dynamic>? _ledgerData;

  @override
  void dispose() {
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _lookupCustomer() async {
    final phone = _phoneCtrl.text.trim();
    if (phone.length != 10) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter a valid 10-digit number')));
      return;
    }

    setState(() {
      _isLoading = true;
      _ledgerData = null;
    });

    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/loyalty/customer/$phone/balance');
      
      setState(() {
        _ledgerData = res.data;
        _isLoading = false;
      });
    } on DioException catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        final msg = e.response?.data?['message'] ?? 'Customer not found or error occurred.';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Customer Ledger'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Lookup Loyalty Ledger', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: BillPushTextField(
                    label: 'Customer Phone',
                    controller: _phoneCtrl,
                    keyboardType: TextInputType.phone,
                  ),
                ),
                const SizedBox(width: 12),
                Padding(
                  padding: const EdgeInsets.only(bottom: 24.0),
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _lookupCustomer,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                    ),
                    child: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Search'),
                  ),
                )
              ],
            ),
            
            if (_ledgerData != null) ...[
              const SizedBox(height: 24),
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('Customer Name: ${_ledgerData!['customer']?['name'] ?? 'N/A'}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildStatColumn('Balance', _ledgerData!['balance']),
                          _buildStatColumn('Earned (LT)', _ledgerData!['lifetimeEarned']),
                          _buildStatColumn('Redeemed (LT)', _ledgerData!['lifetimeRedeemed']),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
              const Text('Transaction Ledger', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              ...(_ledgerData!['ledger'] as List<dynamic>).map((entry) {
                final isPositive = entry['points'] > 0;
                final type = entry['type'];
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(
                    backgroundColor: isPositive ? AppTheme.successColor.withValues(alpha: 0.2) : AppTheme.errorColor.withValues(alpha: 0.2),
                    child: Icon(
                      isPositive ? Icons.add : Icons.remove,
                      color: isPositive ? AppTheme.successColor : AppTheme.errorColor,
                    ),
                  ),
                  title: Text(type, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(DateFormat('dd MMM yyyy, hh:mm a').format(DateTime.parse(entry['created_at']))),
                  trailing: Text(
                    '${isPositive ? '+' : ''}${entry['points']}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isPositive ? AppTheme.successColor : AppTheme.errorColor,
                    ),
                  ),
                );
              }),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildStatColumn(String label, dynamic value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(value.toString(), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
        Text(label, style: const TextStyle(color: Colors.grey)),
      ],
    );
  }
}
