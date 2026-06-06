import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../providers/api_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../config/theme.dart';
import 'package:go_router/go_router.dart';

class SettingsTab extends ConsumerStatefulWidget {
  const SettingsTab({super.key});

  @override
  ConsumerState<SettingsTab> createState() => _SettingsTabState();
}

class _SettingsTabState extends ConsumerState<SettingsTab> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _addrCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _gstCtrl = TextEditingController();
  
  Map<String, dynamic>? _storeData;
  bool _isLoading = true;
  bool _isSaving = false;
  bool _allowDiscounts = true;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _addrCtrl.dispose();
    _cityCtrl.dispose();
    _phoneCtrl.dispose();
    _gstCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchProfile() async {
    try {
      final dio = ref.read(dioProvider);
      final meRes = await dio.get('/auth/me'); // gets user info incl store_id
      final storeId = meRes.data['store_id'];
      
      final res = await dio.get('/stores/$storeId');
      _storeData = res.data;
      
      _nameCtrl.text = _storeData!['name'] ?? '';
      _addrCtrl.text = _storeData!['address'] ?? '';
      _cityCtrl.text = _storeData!['city'] ?? '';
      _phoneCtrl.text = _storeData!['phone'] ?? '';
      _gstCtrl.text = _storeData!['gst_number'] ?? '';
      
      // Store specific logic for discount could go here
    } catch (e) {
      if (mounted) {
         ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to load store profile')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate() || _storeData == null) return;
    
    setState(() => _isSaving = true);
    try {
      final dio = ref.read(dioProvider);
      await dio.patch('/stores/${_storeData!['id']}', data: {
        'name': _nameCtrl.text.trim(),
        'address': _addrCtrl.text.trim(),
        'city': _cityCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'gst_number': _gstCtrl.text.trim(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Store profile updated successfully!'), backgroundColor: AppTheme.successColor));
      }
    } catch(e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to update store profile'), backgroundColor: AppTheme.errorColor));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        appBar: BillPushAppBar(title: 'Store Settings', showBackButton: false),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_storeData == null) {
      return const Scaffold(
        appBar: BillPushAppBar(title: 'Error', showBackButton: false),
        body: Center(child: Text('Could not load profile')),
      );
    }

    return Scaffold(
      appBar: const BillPushAppBar(title: 'Store Settings', showBackButton: false),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Store Profile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Center(
                    child: CircleAvatar(
                      radius: 40,
                      backgroundColor: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                      backgroundImage: _storeData!['logo_url'] != null ? NetworkImage(_storeData!['logo_url']) : null,
                      child: _storeData!['logo_url'] == null ? const Icon(Icons.store, size: 40) : null,
                    ),
                  ),
                  const SizedBox(height: 24),
                  BillPushTextField(label: 'Store Name', controller: _nameCtrl, validator: (v) => v!.isEmpty ? 'Required' : null),
                  BillPushTextField(label: 'Address', controller: _addrCtrl, validator: (v) => v!.isEmpty ? 'Required' : null),
                  BillPushTextField(label: 'City', controller: _cityCtrl, validator: (v) => v!.isEmpty ? 'Required' : null),
                  BillPushTextField(label: 'Phone Number', controller: _phoneCtrl, keyboardType: TextInputType.phone),
                  BillPushTextField(label: 'GST Number (Optional)', controller: _gstCtrl),
                  const SizedBox(height: 16),
                  BillPushButton(text: 'Save Changes', isLoading: _isSaving, onPressed: _saveProfile),
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            const Text('Operations', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const Divider(),
            SwitchListTile(
              title: const Text('Allow Employee Discounts'),
              subtitle: const Text('Cashiers can manually apply discounts'),
              value: _allowDiscounts,
              onChanged: (v) => setState(() => _allowDiscounts = v),
              activeThumbColor: AppTheme.primaryColor,
            ),
            const Divider(thickness: 2),
            const SizedBox(height: 32),
            
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
