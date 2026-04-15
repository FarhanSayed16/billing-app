import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../config/theme.dart';
import '../../../providers/api_provider.dart';
import '../../../providers/auth_provider.dart';

class StoreSetupScreen extends ConsumerStatefulWidget {
  const StoreSetupScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<StoreSetupScreen> createState() => _StoreSetupScreenState();
}

class _StoreSetupScreenState extends ConsumerState<StoreSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _addrCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _gstCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String _selectedState = 'Maharashtra';
  File? _logoImage;
  bool _isLoading = false;

  final List<String> _states = ['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Telangana'];

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() => _logoImage = File(picked.path));
    }
  }

  Future<void> _saveStore() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioProvider);
      
      // 1. Create Store
      final res = await dio.post('/stores', data: {
        'name': _nameCtrl.text.trim(),
        'address': _addrCtrl.text.trim(),
        'city': _cityCtrl.text.trim(),
        'state': _selectedState,
        'gst_number': _gstCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
      });

      final storeId = res.data['id'];

      // 2. Upload Logo if exists
      if (_logoImage != null) {
        String fileName = _logoImage!.path.split('/').last;
        FormData formData = FormData.fromMap({
          "file": await MultipartFile.fromFile(_logoImage!.path, filename: fileName),
        });
        await dio.post('/stores/$storeId/logo', data: formData);
      }

      // Need to force token refresh to include the new storeId in the token
      final authNotifier = ref.read(authProvider.notifier);
      // Wait, we need the new token. We could just log the user out and ask them to log in to get the new store payload, or we can refresh explicitely if we exposed it. Let's redirect to login.
      await authNotifier.logout();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Store created successfully! Please login again.'), backgroundColor: AppTheme.successColor));
      context.go('/login');

    } on DioException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.error.toString()), backgroundColor: AppTheme.errorColor));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Setup Store Profile', showBackButton: false),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              GestureDetector(
                onTap: _pickImage,
                child: CircleAvatar(
                  radius: 50,
                  backgroundColor: Colors.grey.shade200,
                  backgroundImage: _logoImage != null ? FileImage(_logoImage!) : null,
                  child: _logoImage == null ? const Icon(Icons.add_a_photo, size: 40, color: Colors.grey) : null,
                ),
              ),
              const SizedBox(height: 20),
              BillPushTextField(label: 'Store Name', controller: _nameCtrl, validator: (v) => v!.isEmpty ? 'Required' : null),
              BillPushTextField(label: 'Address', controller: _addrCtrl, validator: (v) => v!.isEmpty ? 'Required' : null),
              BillPushTextField(label: 'City', controller: _cityCtrl, validator: (v) => v!.isEmpty ? 'Required' : null),
              DropdownButtonFormField<String>(
                value: _selectedState,
                decoration: const InputDecoration(labelText: 'State'),
                items: _states.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                onChanged: (v) => setState(() => _selectedState = v!),
              ),
              const SizedBox(height: 10),
              BillPushTextField(label: 'GST Number', controller: _gstCtrl),
              BillPushTextField(label: 'Store Phone', controller: _phoneCtrl, keyboardType: TextInputType.phone),
              const SizedBox(height: 20),
              BillPushButton(text: 'Save Store Profile', isLoading: _isLoading, onPressed: _saveStore),
            ],
          ),
        ),
      ),
    );
  }
}
