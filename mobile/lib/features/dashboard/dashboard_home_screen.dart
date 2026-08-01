import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/api_provider.dart';
import '../../config/theme.dart';

class DashboardHomeScreen extends ConsumerStatefulWidget {
  const DashboardHomeScreen({super.key});

  @override
  ConsumerState<DashboardHomeScreen> createState() => _DashboardHomeScreenState();
}

class _DashboardHomeScreenState extends ConsumerState<DashboardHomeScreen> {
  Map<String, dynamic>? _analytics;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchAnalytics();
  }

  Future<void> _fetchAnalytics() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/analytics/global');
      if (mounted) {
        setState(() {
          _analytics = res.data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load analytics';
          _isLoading = false;
        });
      }
    }
  }

  String _formatCurrency(dynamic value) {
    final num = (value is int) ? value.toDouble() : (value as num).toDouble();
    if (num >= 100000) {
      return '₹${(num / 100000).toStringAsFixed(1)}L';
    } else if (num >= 1000) {
      return '₹${(num / 1000).toStringAsFixed(1)}K';
    }
    return '₹${num.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchAnalytics,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.error_outline, size: 48, color: Colors.grey[400]),
                      const SizedBox(height: 12),
                      Text(_error!, style: TextStyle(color: Colors.grey[600])),
                      const SizedBox(height: 12),
                      ElevatedButton(onPressed: _fetchAnalytics, child: const Text('Retry')),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchAnalytics,
                  child: _buildDashboardContent(),
                ),
    );
  }

  Widget _buildDashboardContent() {
    final revenue = _analytics?['revenue'] ?? {};
    final invoices = _analytics?['invoices'] ?? {};
    final activeStores = _analytics?['activeStores'] ?? 0;
    final uniqueCustomers = _analytics?['uniqueCustomers'] ?? 0;
    final changePercent = revenue['changePercent'] ?? 0;
    final topProducts = (_analytics?['topProductsThisMonth'] as List?) ?? [];
    final topStores = (_analytics?['topStoresThisMonth'] as List?) ?? [];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Greeting
        Text(
          'Welcome back!',
          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
        ),
        const SizedBox(height: 4),
        const Text(
          'Here\'s your business overview',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 20),

        // Revenue Cards Row
        Row(
          children: [
            Expanded(
              child: _MetricCard(
                title: "Today's Revenue",
                value: _formatCurrency(revenue['today'] ?? 0),
                icon: Icons.trending_up,
                color: AppTheme.primaryColor,
                subtitle: '${invoices['today'] ?? 0} bills',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _MetricCard(
                title: 'This Month',
                value: _formatCurrency(revenue['month'] ?? 0),
                icon: Icons.calendar_month,
                color: const Color(0xFF10B981),
                subtitle: '${changePercent >= 0 ? '+' : ''}${changePercent.toStringAsFixed(1)}% vs last month',
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Second row
        Row(
          children: [
            Expanded(
              child: _MetricCard(
                title: 'Active Stores',
                value: '$activeStores',
                icon: Icons.store,
                color: const Color(0xFFF59E0B),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _MetricCard(
                title: 'Customers',
                value: '$uniqueCustomers',
                icon: Icons.people,
                color: const Color(0xFF8B5CF6),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // This week row
        Row(
          children: [
            Expanded(
              child: _MetricCard(
                title: 'Weekly Revenue',
                value: _formatCurrency(revenue['week'] ?? 0),
                icon: Icons.show_chart,
                color: const Color(0xFF3B82F6),
                subtitle: '${invoices['week'] ?? 0} bills',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _MetricCard(
                title: 'Yearly Revenue',
                value: _formatCurrency(revenue['year'] ?? 0),
                icon: Icons.bar_chart,
                color: const Color(0xFFEC4899),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Top Products
        if (topProducts.isNotEmpty) ...[
          _SectionHeader(title: 'Top Products This Month', icon: Icons.star),
          const SizedBox(height: 8),
          Card(
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: topProducts.asMap().entries.map((entry) {
                  final i = entry.key;
                  final p = entry.value;
                  return Padding(
                    padding: EdgeInsets.only(bottom: i < topProducts.length - 1 ? 8 : 0),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 14,
                          backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                          child: Text('${i + 1}', style: TextStyle(fontSize: 12, color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(child: Text(p['name'] ?? '', style: const TextStyle(fontSize: 14))),
                        Text('${p['quantity'] ?? 0} sold', style: TextStyle(fontSize: 13, color: Colors.grey[600])),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],

        // Top Stores
        if (topStores.isNotEmpty) ...[
          _SectionHeader(title: 'Top Stores This Month', icon: Icons.storefront),
          const SizedBox(height: 8),
          Card(
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: topStores.asMap().entries.map((entry) {
                  final i = entry.key;
                  final s = entry.value;
                  return Padding(
                    padding: EdgeInsets.only(bottom: i < topStores.length - 1 ? 8 : 0),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 14,
                          backgroundColor: const Color(0xFF10B981).withOpacity(0.1),
                          child: Text('${i + 1}', style: const TextStyle(fontSize: 12, color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(child: Text(s['name'] ?? '', style: const TextStyle(fontSize: 14))),
                        Text(_formatCurrency(s['revenue'] ?? 0), style: TextStyle(fontSize: 13, color: Colors.grey[600], fontWeight: FontWeight.w600)),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],

        // Empty state when no data
        if (topProducts.isEmpty && topStores.isEmpty)
          Card(
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(Icons.insights, size: 48, color: Colors.grey[300]),
                  const SizedBox(height: 12),
                  Text('No sales data yet', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.grey[500])),
                  const SizedBox(height: 4),
                  Text('Start making sales to see analytics here', style: TextStyle(fontSize: 13, color: Colors.grey[400])),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final String? subtitle;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, size: 18, color: color),
                ),
                const Spacer(),
              ],
            ),
            const SizedBox(height: 10),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 2),
            Text(title, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(subtitle!, style: TextStyle(fontSize: 11, color: Colors.grey[500])),
            ],
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;

  const _SectionHeader({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey[700]),
        const SizedBox(width: 8),
        Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.grey[800])),
      ],
    );
  }
}
