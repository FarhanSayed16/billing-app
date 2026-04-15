import 'package:flutter/material.dart';
import '../../providers/auth_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../store_admin/screens/store_dashboard_tab.dart';
import '../store_admin/screens/employees_screen.dart';
import '../store_admin/screens/invoices_screen.dart';
import '../store_admin/screens/settings_tab.dart';

class StoreAdminDashboard extends ConsumerStatefulWidget {
  const StoreAdminDashboard({Key? key}) : super(key: key);

  @override
  ConsumerState<StoreAdminDashboard> createState() => _StoreAdminDashboardState();
}

class _StoreAdminDashboardState extends ConsumerState<StoreAdminDashboard> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const StoreDashboardTab(),
    const InvoicesScreen(),
    const EmployeesScreen(),
    const SettingsTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          if (index == 3) {
            ref.read(authProvider.notifier).logout();
            context.go('/login');
          } else {
            setState(() => _currentIndex = index);
          }
        },
        selectedItemColor: Theme.of(context).primaryColor,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long_outlined), label: 'Invoices'),
          BottomNavigationBarItem(icon: Icon(Icons.people_outline), label: 'Staff'),
          BottomNavigationBarItem(icon: Icon(Icons.settings_outlined), label: 'Settings'),
        ],
      ),
    );
  }
}
