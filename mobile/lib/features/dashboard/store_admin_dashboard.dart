import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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

  void _switchTab(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final screens = <Widget>[
      StoreDashboardTab(onSwitchTab: _switchTab),
      const InvoicesScreen(),
      const EmployeesScreen(),
      const SettingsTab(),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _switchTab,
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
