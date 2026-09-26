import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/api_provider.dart';
import '../../../core/utils/error_message.dart';
import 'dashboard_home_screen.dart';
import '../super_admin/screens/approvals_screen.dart';
import '../super_admin/screens/stores_list_screen.dart';
import '../../../config/theme.dart';

class SuperAdminDashboard extends ConsumerStatefulWidget {
  const SuperAdminDashboard({super.key});

  @override
  ConsumerState<SuperAdminDashboard> createState() => _SuperAdminDashboardState();
}

class _SuperAdminDashboardState extends ConsumerState<SuperAdminDashboard> {
  int _currentIndex = 0;
  int _pendingCount = 0;
  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      const DashboardHomeScreen(),
      const StoresListScreen(),
      const ApprovalsScreen(),
      _buildSettingsTab(),
    ];
    _fetchPendingCount();
  }

  Future<void> _fetchPendingCount() async {
    try {
      final res = await ref.read(dioProvider).get('/auth/pending-registrations');
      if (mounted) setState(() => _pendingCount = (res.data as List).length);
    } catch (e) {
      // Non-blocking badge refresh — show snackbar only when user opens Approvals tab
      debugPrint('Pending approvals fetch failed: ${apiErrorMessage(e)}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() => _currentIndex = index);
          if (index == 2) _fetchPendingCount();
        },
        type: BottomNavigationBarType.fixed,
        items: [
          const BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          const BottomNavigationBarItem(icon: Icon(Icons.store_outlined), label: 'Stores'),
          BottomNavigationBarItem(
            icon: Badge(
              label: Text('$_pendingCount'),
              isLabelVisible: _pendingCount > 0,
              child: const Icon(Icons.verified_user_outlined),
            ),
            label: 'Approvals'
          ),
          const BottomNavigationBarItem(icon: Icon(Icons.settings_outlined), label: 'Settings'),
        ],
      ),
    );
  }

  Widget _buildSettingsTab() {
    return Scaffold(
      appBar: const PreferredSize(
        preferredSize: Size.fromHeight(kToolbarHeight),
        child: SafeArea(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            child: Text('Settings', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ListTile(
              leading: const Icon(Icons.inventory_2_outlined),
              title: const Text('Products'),
              subtitle: const Text('Catalog, barcodes, and bulk upload'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/super-admin/products'),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.manage_accounts_outlined),
              title: const Text('Customer Ledger'),
              subtitle: const Text('Search customers and loyalty'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/super-admin/customer-ledger'),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.history),
              title: const Text('Audit Logs'),
              subtitle: const Text('Review staff and system actions'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/super-admin/audit'),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.download_outlined),
              title: const Text('Data Exports'),
              subtitle: const Text('Download CSV reports'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push('/super-admin/exports'),
            ),
            const Divider(),
            const ListTile(
              leading: Icon(Icons.person_outline),
              title: Text('Account'),
              subtitle: Text('Manage your account details'),
            ),
            const Divider(),
            const ListTile(
              leading: Icon(Icons.notifications_outlined),
              title: Text('Notifications'),
              subtitle: Text('Push notification preferences'),
            ),
            const Divider(),
            const Spacer(),
            OutlinedButton.icon(
              icon: const Icon(Icons.logout),
              label: const Text('Log Out'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.errorColor,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              onPressed: () {
                ref.read(authProvider.notifier).logout();
                context.go('/login');
              },
            ),
          ],
        ),
      ),
    );
  }
}
