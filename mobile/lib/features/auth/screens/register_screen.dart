import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../config/theme.dart';
import '../../../providers/api_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  bool _isLoading = false;

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;
    if (_passCtrl.text != _confirmPassCtrl.text) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Passwords do not match'), backgroundColor: AppTheme.errorColor));
      return;
    }

    setState(() => _isLoading = true);
    try {
      await ref.read(dioProvider).post('/auth/register', data: {
        'name': _nameCtrl.text.trim(),
        'email': _emailCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'password': _passCtrl.text,
      });

      if (!mounted) return;
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Registration Submitted'),
          content: const Text('Your registration has been submitted. You will be notified when the Super Admin approves it.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                context.go('/login');
              },
              child: const Text('OK')
            )
          ],
        )
      );
    } on DioException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.error.toString()), backgroundColor: AppTheme.errorColor));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Register Store Admin'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              BillPushTextField(
                label: 'Full Name',
                controller: _nameCtrl,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              BillPushTextField(
                label: 'Email Address',
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                validator: (v) => !v!.contains('@') ? 'Invalid Email' : null,
              ),
              BillPushTextField(
                label: 'Phone Number',
                controller: _phoneCtrl,
                keyboardType: TextInputType.phone,
                validator: (v) => v!.length < 10 ? 'Invalid Phone' : null,
              ),
              BillPushTextField(
                label: 'Password',
                controller: _passCtrl,
                isPassword: true,
                validator: (v) => v!.length < 8 ? 'Min 8 characters' : null,
              ),
              BillPushTextField(
                label: 'Confirm Password',
                controller: _confirmPassCtrl,
                isPassword: true,
              ),
              const SizedBox(height: 20),
              BillPushButton(
                text: 'Register',
                isLoading: _isLoading,
                onPressed: _register,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
