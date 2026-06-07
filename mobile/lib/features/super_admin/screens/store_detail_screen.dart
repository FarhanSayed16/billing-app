import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../providers/api_provider.dart';
import '../../../config/theme.dart';

class StoreDetailScreen extends ConsumerStatefulWidget {
  final String storeId;
  const StoreDetailScreen({super.key, required this.storeId});

  @override
  ConsumerState<StoreDetailScreen> createState() => _StoreDetailScreenState();
}

class _StoreDetailScreenState extends ConsumerState<StoreDetailScreen> {
  Map<String, dynamic>? _store;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchStoreDetails();
  }

  Future<void> _fetchStoreDetails() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/stores/${widget.storeId}');
      setState(() => _store = res.data);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load store details'), backgroundColor: AppTheme.errorColor),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleStatus(bool newStatus) async {
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioProvider);
      final action = newStatus ? 'activate' : 'deactivate';
      await dio.patch('/stores/${widget.storeId}/$action');
      _fetchStoreDetails();
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update status'), backgroundColor: AppTheme.errorColor),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _store == null) {
      return const Scaffold(
        appBar: BillPushAppBar(title: 'Store Details'),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_store == null) {
      return const Scaffold(
        appBar: BillPushAppBar(title: 'Error'),
        body: Center(child: Text('Could not load data')),
      );
    }

    final store = _store!;
    final isActive = store['is_active'] == true;

    return Scaffold(
      appBar: const BillPushAppBar(title: 'Store Details'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: CircleAvatar(
                radius: 50,
                backgroundImage: store['logo_url'] != null ? NetworkImage(store['logo_url']) : null,
                backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                child: store['logo_url'] == null ? const Icon(Icons.store, size: 40) : null,
              ),
            ),
            const SizedBox(height: 20),
            Text(store['name'], textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.circle, size: 14, color: isActive ? AppTheme.successColor : AppTheme.errorColor),
                const SizedBox(width: 8),
                Text(isActive ? 'ACTIVE' : 'INACTIVE', style: const TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 32),
            const Text('Metrics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _MetricCard(title: 'Employees', value: store['employee_count'].toString(), icon: Icons.people)),
                const SizedBox(width: 16),
                Expanded(child: _MetricCard(title: 'Total Invoices', value: store['total_invoices'].toString(), icon: Icons.receipt)),
              ],
            ),
            const SizedBox(height: 32),
            const Text('Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ListTile(leading: const Icon(Icons.location_on), title: Text(store['address']), subtitle: Text('${store['city']}, ${store['state']}')),
            ListTile(leading: const Icon(Icons.phone), title: Text(store['phone'] ?? 'N/A')),
            ListTile(leading: const Icon(Icons.receipt_long), title: Text(store['gst_number'] ?? 'N/A')),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () => _toggleStatus(!isActive),
              icon: Icon(isActive ? Icons.block : Icons.check_circle, color: Colors.white),
              style: ElevatedButton.styleFrom(
                backgroundColor: isActive ? AppTheme.errorColor : AppTheme.successColor,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              label: Text(isActive ? 'Deactivate Store' : 'Activate Store'),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;

  const _MetricCard({required this.title, required this.value, required this.icon});

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
            Text(title, style: const TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
