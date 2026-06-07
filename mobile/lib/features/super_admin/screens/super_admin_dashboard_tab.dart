import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../widgets/animated_counter.dart';
import '../../../providers/api_provider.dart';
import '../../../config/theme.dart';
import 'package:go_router/go_router.dart';

class SuperAdminDashboardTab extends ConsumerStatefulWidget {
  const SuperAdminDashboardTab({super.key});

  @override
  ConsumerState<SuperAdminDashboardTab> createState() => _SuperAdminDashboardTabState();
}

class _SuperAdminDashboardTabState extends ConsumerState<SuperAdminDashboardTab> {
  bool _isLoading = true;
  Map<String, dynamic>? _globalData;
  List<dynamic>? _chartData;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final dio = ref.read(dioProvider);
      final responses = await Future.wait([
        dio.get('/analytics/global'),
        dio.get('/analytics/revenue-chart'),
      ]);
      
      if (mounted) {
        setState(() {
          _globalData = responses[0].data;
          _chartData = responses[1].data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_globalData == null) {
      return const Center(child: Text('Failed to load dashboard data.'));
    }

    final topStores = _globalData!['topStoresThisMonth'] as List;
    final topProducts = (_globalData!['topProductsThisMonth'] as List?) ?? [];
    final newCustomers = _globalData!['newCustomers'] as Map<String, dynamic>?;

    return Scaffold(
      appBar: const PreferredSize(
        preferredSize: Size.fromHeight(kToolbarHeight),
        child: SafeArea(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            child: Text('Global Overview', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _fetchData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildRevenueCards(),
              const SizedBox(height: 24),
              _buildKPIBar(),
              const SizedBox(height: 32),
              const Text('Revenue Trend (Last 7 Days)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              _buildChart(),
              const SizedBox(height: 32),
              const Text('Top Performing Stores (Month)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              if (topStores.isEmpty)
                const Text('No stores with revenue this month.', style: TextStyle(color: Colors.grey))
              else
                ...topStores.map((store) => Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: const CircleAvatar(backgroundColor: AppTheme.primaryColor, child: Icon(Icons.store, color: Colors.white)),
                    title: Text(store['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                    trailing: Text('₹${store['revenue']}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.successColor)),
                  ),
                )),
              if (topProducts.isNotEmpty) ...[
                const SizedBox(height: 32),
                const Text('Top Products (Month)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                ...topProducts.map((prod) => Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: const CircleAvatar(backgroundColor: AppTheme.successColor, child: Icon(Icons.inventory_2, color: Colors.white, size: 20)),
                    title: Text(prod['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                    trailing: Text('${prod['quantity']} sold', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                )),
              ],
              if (newCustomers != null) ...[
                const SizedBox(height: 32),
                const Text('Customer Growth', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              const Icon(Icons.person_add, color: AppTheme.primaryColor, size: 28),
                              const SizedBox(height: 8),
                              Text('${newCustomers['thisWeek'] ?? 0}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                              const Text('New This Week', style: TextStyle(color: Colors.grey)),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              const Icon(Icons.history, color: Colors.grey, size: 28),
                              const SizedBox(height: 8),
                              Text('${newCustomers['lastWeek'] ?? 0}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                              const Text('Last Week', style: TextStyle(color: Colors.grey)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () => context.push('/super-admin/customer-ledger'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: AppTheme.primaryColor,
                  ),
                  icon: const Icon(Icons.manage_accounts, color: Colors.white),
                  label: const Text('View Customer Ledger', style: TextStyle(color: Colors.white)),
                ),
              ],
              const SizedBox(height: 80), // spacer for bottom nav
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRevenueCards() {
    final revenue = _globalData!['revenue'];
    final changePercent = (revenue['changePercent'] ?? 0).toDouble();
    final isPositive = changePercent >= 0;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppTheme.shadowMd,
      ),
      child: Column(
        children: [
          const Text('Today\'s Revenue', style: TextStyle(color: Colors.white70, fontSize: 16)),
          const SizedBox(height: 8),
          AnimatedCounter(
            value: double.parse(revenue['today'].toString()),
            prefix: '₹',
            fractionDigits: 2,
            style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(isPositive ? Icons.trending_up : Icons.trending_down, color: Colors.white, size: 16),
                const SizedBox(width: 4),
                Text(
                  '${isPositive ? '+' : ''}${changePercent.toStringAsFixed(1)}% vs last month',
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('This Week', style: TextStyle(color: Colors.white70)),
                  Text('₹${revenue['week']}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('This Month', style: TextStyle(color: Colors.white70)),
                  Text('₹${revenue['month']}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildKPIBar() {
    return Row(
      children: [
        Expanded(
          child: Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Icon(Icons.storefront, color: AppTheme.primaryColor, size: 32),
                  const SizedBox(height: 8),
                  Text('${_globalData!['activeStores']}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const Text('Active Stores', style: TextStyle(color: Colors.grey)),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Icon(Icons.people_outline, color: AppTheme.primaryColor, size: 32),
                  const SizedBox(height: 8),
                  Text('${_globalData!['uniqueCustomers']}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const Text('Customers', style: TextStyle(color: Colors.grey)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildChart() {
    if (_chartData == null || _chartData!.isEmpty) return const SizedBox(height: 200, child: Center(child: Text('No chart data')));

    List<FlSpot> spots = [];
    double maxX = _chartData!.length.toDouble() - 1;
    double maxY = 0;

    for (int i = 0; i < _chartData!.length; i++) {
      double val = double.parse(_chartData![i]['revenue'].toString());
      if (val > maxY) maxY = val;
      spots.add(FlSpot(i.toDouble(), val));
    }

    if (maxY == 0) maxY = 100; // default cap if zero revenue

    return SizedBox(
      height: 250,
      child: LineChart(
        LineChartData(
          minY: 0,
          maxY: maxY * 1.2,
          minX: 0,
          maxX: maxX,
          gridData: FlGridData(show: true, drawVerticalLine: false, getDrawingHorizontalLine: (val) => FlLine(color: Colors.grey.withValues(alpha: 0.2), strokeWidth: 1)),
          titlesData: FlTitlesData(
            leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  int idx = value.toInt();
                  if (idx >= 0 && idx < _chartData!.length) {
                    // format date "MM-DD"
                    final dateStr = _chartData![idx]['date'].toString();
                    final parts = dateStr.split('-');
                    if (parts.length == 3) {
                      return Padding(padding: const EdgeInsets.only(top: 8), child: Text('${parts[1]}/${parts[2]}', style: const TextStyle(fontSize: 10)));
                    }
                  }
                  return const Text('');
                },
              ),
            ),
          ),
          borderData: FlBorderData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              color: AppTheme.primaryColor,
              barWidth: 4,
              isStrokeCapRound: true,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                color: AppTheme.primaryColor.withValues(alpha: 0.15),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
