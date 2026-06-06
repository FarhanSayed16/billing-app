import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart' as dio;
import 'dart:io';
import '../../../widgets/custom_widgets.dart';
import '../../../providers/api_provider.dart';
import '../../../widgets/toast_widget.dart';

class AddEditProductScreen extends ConsumerStatefulWidget {
  const AddEditProductScreen({super.key});

  @override
  ConsumerState<AddEditProductScreen> createState() => _AddEditProductScreenState();
}

class _AddEditProductScreenState extends ConsumerState<AddEditProductScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _skuCtrl = TextEditingController();
  final _barcodeCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _taxCtrl = TextEditingController();
  String _category = 'Uncategorized';
  
  bool _isLoading = false;
  File? _selectedImage;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _skuCtrl.dispose();
    _barcodeCtrl.dispose();
    _priceCtrl.dispose();
    _taxCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() => _selectedImage = File(picked.path));
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      final api = ref.read(dioProvider);
      
      // Create product
      final res = await api.post('/products', data: {
        'name': _nameCtrl.text,
        'sku': _skuCtrl.text.isEmpty ? null : _skuCtrl.text,
        'barcode': _barcodeCtrl.text.isEmpty ? null : _barcodeCtrl.text,
        'category': _category,
        'base_price': double.parse(_priceCtrl.text),
        'tax_rate': double.parse(_taxCtrl.text.isEmpty ? '0' : _taxCtrl.text),
      });

      final productId = res.data['id'];

      // Upload image if selected
      if (_selectedImage != null) {
        final formData = dio.FormData.fromMap({
          'file': await dio.MultipartFile.fromFile(_selectedImage!.path),
        });
        await api.post('/products/$productId/image', data: formData);
      }

      if (mounted) {
        BillPushToast.success(context, 'Product added successfully');
        context.pop(true); // Return true to signal refresh needed
      }
    } catch (e) {
      if (mounted) {
        BillPushToast.error(context, 'Failed to add product');
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Add Product'),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Center(
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: Container(
                          width: 120, height: 120,
                          decoration: BoxDecoration(
                            color: Colors.grey.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.grey.withValues(alpha: 0.5)),
                          ),
                          child: _selectedImage != null
                              ? ClipRRect(borderRadius: BorderRadius.circular(16), child: Image.file(_selectedImage!, fit: BoxFit.cover))
                              : const Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.add_a_photo, size: 40, color: Colors.grey),
                                    SizedBox(height: 8),
                                    Text('Upload', style: TextStyle(color: Colors.grey)),
                                  ],
                                ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    BillPushTextField(
                      label: 'Product Name *',
                      controller: _nameCtrl,
                      validator: (v) => v!.isEmpty ? 'Required' : null,
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: BillPushTextField(
                            label: 'Base Price (₹) *',
                            controller: _priceCtrl,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            validator: (v) => v!.isEmpty ? 'Required' : null,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: BillPushTextField(
                            label: 'Tax Rate (%)',
                            controller: _taxCtrl,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          ),
                        ),
                      ],
                    ),
                    BillPushTextField(
                      label: 'SKU (Optional)',
                      controller: _skuCtrl,
                    ),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: BillPushTextField(
                            label: 'Barcode (Optional)',
                            controller: _barcodeCtrl,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 24.0),
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(padding: const EdgeInsets.all(16)),
                            icon: const Icon(Icons.qr_code_scanner),
                            label: const Text('Scan'),
                            onPressed: () { 
                              // Optional: Launch scanner here just to read barcode payload 
                            },
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text('Category', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.withValues(alpha: 0.3)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _category,
                          isExpanded: true,
                          items: ['Uncategorized', 'Beverages', 'Snacks', 'Groceries', 'Electronics']
                              .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                              .toList(),
                          onChanged: (v) => setState(() => _category = v!),
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                    BillPushButton(
                      text: 'Save Product',
                      onPressed: _submit,
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
