import 'package:flutter/material.dart';
import '../../providers/auth_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../super_admin/screens/approvals_screen.dart';
import '../super_admin/screens/stores_list_screen.dart';

class SuperAdminDashboard extends ConsumerStatefulWidget {
  const SuperAdminDashboard({Key? key}) : super(key: key);

  @override
  ConsumerState<SuperAdminDashboard> createState() => _SuperAdminDashboardState();
}

class _SuperAdminDashboardState extends ConsumerState<SuperAdminDashboard> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const Center(child: Text('Dashboard Placeholder (Phase 2)')),
    const StoresListScreen(),
    const ApprovalsScreen(),
    const Center(child: Text('Settings Placeholder')),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          if (index == 3) {
            // Quick logout for settings placeholder
            ref.read(authProvider.notifier).logout();
            context.go('/login');
          } else {
            setState(() => _currentIndex = index);
          }
        },
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.store_outlined), label: 'Stores'),
          BottomNavigationBarItem(icon: Icon(Icons.verified_user_outlined), label: 'Approvals'),
          BottomNavigationBarItem(icon: Icon(Icons.settings_outlined), label: 'Settings'),
        ],
      ),
    );
  }
}
