import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/api_provider.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../config/theme.dart';
import '../../../providers/cart_provider.dart';

class PosHomeScreen extends ConsumerStatefulWidget {
  const PosHomeScreen({super.key});

  @override
  ConsumerState<PosHomeScreen> createState() => _PosHomeScreenState();
}

class _PosHomeScreenState extends ConsumerState<PosHomeScreen> {
  String _employeeName = 'Employee';
  String _storeName = 'Your Store';

  @override
  void initState() {
    super.initState();
    _fetchUserInfo();
  }

  Future<void> _fetchUserInfo() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/auth/me');
      if (mounted) {
        setState(() {
          _employeeName = res.data['name'] ?? 'Employee';
          _storeName = res.data['store']?['name'] ?? res.data['store_name'] ?? 'Your Store';
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: BillPushAppBar(
        title: _storeName,
        showBackButton: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
              context.go('/login');
            },
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Welcome, $_employeeName', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: AppTheme.successColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
                  child: const Row(
                    children: [
                      Icon(Icons.circle, color: AppTheme.successColor, size: 10),
                      SizedBox(width: 6),
                      Text('ONLINE', style: TextStyle(color: AppTheme.successColor, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
            const Spacer(),
            SizedBox(
              height: 120,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.add_shopping_cart, size: 40, color: Colors.white),
                label: const Text('NEW BILL', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
                onPressed: () {
                  ref.read(cartProvider.notifier).clearCart();
                  context.push('/employee/pos/customer');
                },
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 80,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.receipt_long, size: 30),
                label: const Text('Recent Bills', style: TextStyle(fontSize: 20)),
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  side: const BorderSide(color: AppTheme.primaryColor, width: 2),
                ),
                onPressed: () => context.push('/employee/pos/recent'),
              ),
            ),
            const Spacer(flex: 2),
          ],
        ),
      ),
    );
  }
}
