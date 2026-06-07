import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../providers/api_provider.dart';
import '../../../config/theme.dart';

class StoreDashboardTab extends ConsumerStatefulWidget {
  final void Function(int)? onSwitchTab;
  const StoreDashboardTab({super.key, this.onSwitchTab});

  @override
  ConsumerState<StoreDashboardTab> createState() => _StoreDashboardTabState();
}

class _StoreDashboardTabState extends ConsumerState<StoreDashboardTab> {
  num _todayRevenue = 0;
  int _todayBills = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTodayStats();
  }

  Future<void> _fetchTodayStats() async {
    try {
      final dio = ref.read(dioProvider);
      
      // Get today's start and end times in ISO format
      final now = DateTime.now();
      final startOfDay = DateTime(now.year, now.month, now.day).toIso8601String();
      final endOfDay = DateTime(now.year, now.month, now.day, 23, 59, 59).toIso8601String();
      
      final res = await dio.get('/invoices', queryParameters: {
        'date_from': startOfDay,
        'date_to': endOfDay,
        'limit': 1000 // Get all for today (MVP limitation)
      });
      
      final invoices = res.data['data'] as List;
      
      num revenue = 0;
      for (var inf in invoices) {
        // Exclude completely refunded items from revenue calculation based on status (assuming status ACTIVE vs FULLY_REFUNDED)
        if (inf['status'] != 'FULLY_REFUNDED') {
          revenue += inf['grand_total'];
        }
      }
      
      setState(() {
        _todayBills = invoices.length;
        _todayRevenue = revenue;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load dashboard stats'), backgroundColor: AppTheme.errorColor),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        appBar: BillPushAppBar(title: 'Store Dashboard', showBackButton: false),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final avgBill = _todayBills > 0 ? (_todayRevenue / _todayBills).toStringAsFixed(2) : '0.00';

    return Scaffold(
      appBar: const BillPushAppBar(title: 'Store Dashboard', showBackButton: false),
      body: RefreshIndicator(
        onRefresh: _fetchTodayStats,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Card(
                color: AppTheme.primaryColor,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 4,
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      const Text('Today\'s Revenue', style: TextStyle(color: Colors.white70, fontSize: 16)),
                      const SizedBox(height: 8),
                      Text('₹${_todayRevenue.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: _StatCard(title: 'Bills Generated', value: _todayBills.toString(), icon: Icons.receipt_outlined),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _StatCard(title: 'Avg. Bill Value', value: '₹$avgBill', icon: Icons.trending_up, isCurrency: true),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              const Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        widget.onSwitchTab?.call(2); // Switch to Staff tab
                      },
                      icon: const Icon(Icons.people),
                      label: const Text('View Staff'),
                      style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        widget.onSwitchTab?.call(1); // Switch to Invoices tab
                      },
                      icon: const Icon(Icons.receipt_long),
                      label: const Text('View Invoices'),
                      style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final bool isCurrency;

  const _StatCard({required this.title, required this.value, required this.icon, this.isCurrency = false});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: AppTheme.primaryColor, size: 32),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text(title, textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
