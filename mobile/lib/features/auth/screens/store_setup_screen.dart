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
  const StoreSetupScreen({super.key});

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
  Color _brandColor = AppTheme.primaryColor;
  bool _isLoading = false;

  static const List<String> _states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  ];

  static const List<Color> _colorOptions = [
    Color(0xFF1E88E5), // Blue
    Color(0xFF43A047), // Green
    Color(0xFFE53935), // Red
    Color(0xFF8E24AA), // Purple
    Color(0xFFFB8C00), // Orange
    Color(0xFF00ACC1), // Teal
    Color(0xFF3949AB), // Indigo
    Color(0xFF546E7A), // Grey
    Color(0xFFD81B60), // Pink
    Color(0xFF000000), // Black
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _addrCtrl.dispose();
    _cityCtrl.dispose();
    _gstCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery, maxWidth: 512);
    if (picked != null) {
      setState(() => _logoImage = File(picked.path));
    }
  }

  String _colorToHex(Color c) => '#${c.toARGB32().toRadixString(16).substring(2).toUpperCase()}';

  Future<void> _saveStore() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioProvider);
      
      final res = await dio.post('/stores', data: {
        'name': _nameCtrl.text.trim(),
        'address': _addrCtrl.text.trim(),
        'city': _cityCtrl.text.trim(),
        'state': _selectedState,
        'gst_number': _gstCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'brand_color': _colorToHex(_brandColor),
      });

      final storeId = res.data['id'];

      if (_logoImage != null) {
        String fileName = _logoImage!.path.split('/').last;
        FormData formData = FormData.fromMap({
          "file": await MultipartFile.fromFile(_logoImage!.path, filename: fileName),
        });
        await dio.post('/stores/$storeId/logo', data: formData);
      }

      // Force re-login to get new JWT with store_id
      final authNotifier = ref.read(authProvider.notifier);
      await authNotifier.logout();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Store created successfully! Please login again.'), backgroundColor: AppTheme.successColor)
      );
      context.go('/login');

    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.error?.toString() ?? 'Failed'), backgroundColor: AppTheme.errorColor)
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Setup Store Profile', showBackButton: false),
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Logo picker
                Center(
                  child: GestureDetector(
                    onTap: _pickImage,
                    child: CircleAvatar(
                      radius: 50,
                      backgroundColor: Colors.grey.shade200,
                      backgroundImage: _logoImage != null ? FileImage(_logoImage!) : null,
                      child: _logoImage == null
                          ? const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.add_a_photo, size: 28, color: Colors.grey),
                                SizedBox(height: 4),
                                Text('Add Logo', style: TextStyle(fontSize: 10, color: Colors.grey)),
                              ],
                            )
                          : null,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                BillPushTextField(label: 'Store Name', controller: _nameCtrl, prefixIcon: const Icon(Icons.store), validator: (v) => v!.isEmpty ? 'Required' : null),
                BillPushTextField(label: 'Address', controller: _addrCtrl, prefixIcon: const Icon(Icons.location_on_outlined), validator: (v) => v!.isEmpty ? 'Required' : null),
                BillPushTextField(label: 'City', controller: _cityCtrl, prefixIcon: const Icon(Icons.location_city), validator: (v) => v!.isEmpty ? 'Required' : null),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: DropdownButtonFormField<String>(
                    initialValue: _selectedState,
                    decoration: const InputDecoration(labelText: 'State', prefixIcon: Icon(Icons.map_outlined)),
                    items: _states.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                    onChanged: (v) => setState(() => _selectedState = v!),
                  ),
                ),
                BillPushTextField(label: 'GST Number', controller: _gstCtrl, prefixIcon: const Icon(Icons.receipt_long)),
                BillPushTextField(label: 'Store Phone', controller: _phoneCtrl, keyboardType: TextInputType.phone, prefixIcon: const Icon(Icons.phone_outlined)),
                
                // Brand Color Picker
                const SizedBox(height: 16),
                Text('Brand Color', style: Theme.of(context).textTheme.bodyLarge),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: _colorOptions.map((color) => GestureDetector(
                    onTap: () => setState(() => _brandColor = color),
                    child: Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                        border: _brandColor == color
                            ? Border.all(color: Colors.white, width: 3)
                            : null,
                        boxShadow: _brandColor == color
                            ? [BoxShadow(color: color.withValues(alpha: 0.5), blurRadius: 8, spreadRadius: 2)]
                            : null,
                      ),
                      child: _brandColor == color
                          ? const Icon(Icons.check, color: Colors.white, size: 20)
                          : null,
                    ),
                  )).toList(),
                ),

                const SizedBox(height: 24),
                BillPushButton(text: 'Save Store Profile', isLoading: _isLoading, onPressed: _saveStore),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
