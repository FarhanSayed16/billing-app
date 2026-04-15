import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../config/theme.dart';
import '../../../providers/api_provider.dart';
import '../../../providers/cart_provider.dart';

class CustomerEntryScreen extends ConsumerStatefulWidget {
  const CustomerEntryScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<CustomerEntryScreen> createState() => _CustomerEntryScreenState();
}

class _CustomerEntryScreenState extends ConsumerState<CustomerEntryScreen> {
  final _phoneCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  bool _isLoading = false;
  Map<String, dynamic>? _foundCustomer;
  bool _searched = false;

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _lookupCustomer() async {
    final phone = _phoneCtrl.text.trim();
    if (phone.length != 10) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter a valid 10-digit number')));
      return;
    }

    setState(() => _isLoading = true);
    
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/customers/lookup/$phone');
      
      setState(() {
        _foundCustomer = res.data;
        _nameCtrl.text = _foundCustomer!['name'] ?? '';
        _searched = true;
        _isLoading = false;
      });
    } on DioException catch (e) {
      setState(() {
        _foundCustomer = null;
        _searched = true;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _proceedToCart() {
    final phone = _phoneCtrl.text.trim();
    final name = _foundCustomer != null ? _foundCustomer!['name'] : _nameCtrl.text.trim();
    
    if (name.isEmpty) {
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please provide customer name')));
       return;
    }

    ref.read(cartProvider.notifier).setCustomer(CustomerInfo(
      id: _foundCustomer?['id'], // null if new customer, backend handles it during POST
      name: name,
      phone: phone,
      loyaltyPoints: _foundCustomer?['loyalty_points'] ?? 0,
    ));

    context.push('/employee/pos/cart');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Customer Details'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Enter Phone Number', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: BillPushTextField(
                    label: '10-Digit Mobile',
                    controller: _phoneCtrl,
                    keyboardType: TextInputType.phone,
                  ),
                ),
                const SizedBox(width: 12),
                Padding(
                  padding: const EdgeInsets.only(bottom: 24.0), // match error padding roughly
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _lookupCustomer,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                    ),
                    child: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Lookup'),
                  ),
                )
              ],
            ),
            
            if (_searched && _foundCustomer != null) ...[
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.successColor.withOpacity(0.1),
                  border: Border.all(color: AppTheme.successColor),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Text('Welcome back, ${_foundCustomer!['name']}!', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.successColor)),
                    const SizedBox(height: 8),
                    Text('Loyalty Points Available: ${_foundCustomer!['loyalty_points']}', style: const TextStyle(fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
              const SizedBox(height: 40),
            ] else if (_searched && _foundCustomer == null) ...[
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
                child: const Row(
                  children: [
                    Icon(Icons.person_add_alt_1, color: Colors.grey),
                    SizedBox(width: 8),
                    Text('New Customer Registration', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              BillPushTextField(
                label: 'Customer Name',
                controller: _nameCtrl,
              ),
              const SizedBox(height: 20),
            ],

            if (_searched)
              BillPushButton(
                text: 'Continue to Cart',
                onPressed: _proceedToCart,
              ),
              
            const SizedBox(height: 48),
            // Easy bypass for 'Guest'
            Center(
              child: TextButton(
                onPressed: () {
                   ref.read(cartProvider.notifier).setCustomer(CustomerInfo(name: 'Guest', phone: '0000000000'));
                   context.push('/employee/pos/cart');
                },
                child: const Text('Skip & Continue as Guest', style: TextStyle(color: Colors.grey, decoration: TextDecoration.underline)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
