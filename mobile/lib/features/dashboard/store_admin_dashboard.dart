import 'package:flutter/material.dart';

class StoreAdminDashboard extends StatelessWidget {
  const StoreAdminDashboard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Store Admin Dashboard')),
      body: const Center(child: Text('Store Admin Home')),
    );
  }
}
