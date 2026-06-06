import 'package:flutter/material.dart';
import '../../providers/auth_provider.dart';
import '../../providers/api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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

  @override
  void initState() {
    super.initState();
    _fetchPendingCount();
  }

  Future<void> _fetchPendingCount() async {
    try {
      final res = await ref.read(dioProvider).get('/auth/pending-registrations');
      if (mounted) setState(() => _pendingCount = (res.data as List).length);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final screens = <Widget>[
      const Center(child: Text('Dashboard Placeholder (Phase 2)')),
      const StoresListScreen(),
      const ApprovalsScreen(),
      _buildSettingsTab(),
    ];

    return Scaffold(
      body: screens[_currentIndex],
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
