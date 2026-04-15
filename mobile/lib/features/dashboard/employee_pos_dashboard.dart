import 'package:flutter/material.dart';

class EmployeePosDashboard extends StatelessWidget {
  const EmployeePosDashboard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('POS Dashboard')),
      body: const Center(child: Text('POS Home')),
    );
  }
}
