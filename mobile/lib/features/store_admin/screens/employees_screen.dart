import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../providers/api_provider.dart';
import '../../../config/theme.dart';

class EmployeesScreen extends ConsumerStatefulWidget {
  const EmployeesScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<EmployeesScreen> createState() => _EmployeesScreenState();
}

class _EmployeesScreenState extends ConsumerState<EmployeesScreen> {
  List<dynamic> _employees = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchEmployees();
  }

  Future<void> _fetchEmployees() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/employees');
      setState(() => _employees = res.data);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load employees'), backgroundColor: AppTheme.errorColor),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleStatus(String empId, bool isActive) async {
    try {
      final dio = ref.read(dioProvider);
      await dio.patch('/employees/$empId', data: {'is_active': !isActive});
      _fetchEmployees();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update status'), backgroundColor: AppTheme.errorColor),
        );
      }
    }
  }

  void _showAddEmployeeSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => _AddEmployeeForm(onSuccess: _fetchEmployees),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Staff Management', showBackButton: false),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddEmployeeSheet,
        backgroundColor: AppTheme.primaryColor,
        child: const Icon(Icons.person_add),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchEmployees,
              child: _employees.isEmpty
                  ? ListView(children: const [SizedBox(height: 100), Center(child: Text('No staff found'))])
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _employees.length,
                      itemBuilder: (context, index) {
                        final emp = _employees[index];
                        final isActive = emp['is_active'] == true;
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                              child: Text(emp['name'].substring(0, 1).toUpperCase()),
                            ),
                            title: Text(emp['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text(emp['phone'] ?? 'No phone'),
                            trailing: Switch(
                              value: isActive,
                              activeColor: AppTheme.successColor,
                              onChanged: (_) => _toggleStatus(emp['id'], isActive),
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}

class _AddEmployeeForm extends ConsumerStatefulWidget {
  final VoidCallback onSuccess;
  const _AddEmployeeForm({required this.onSuccess});

  @override
  ConsumerState<_AddEmployeeForm> createState() => _AddEmployeeFormState();
}

class _AddEmployeeFormState extends ConsumerState<_AddEmployeeForm> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _pinCtrl = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _pinCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioProvider);
      await dio.post('/employees', data: {
        'name': _nameCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'pin': _pinCtrl.text.trim(),
      });
      if (mounted) {
        Navigator.pop(context);
        widget.onSuccess();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to add employee'), backgroundColor: AppTheme.errorColor),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 24, right: 24, top: 24),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Add New Staff', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            BillPushTextField(
              label: 'Full Name',
              controller: _nameCtrl,
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            BillPushTextField(
              label: 'Phone Number',
              controller: _phoneCtrl,
              keyboardType: TextInputType.phone,
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            BillPushTextField(
              label: '4-Digit PIN',
              controller: _pinCtrl,
              keyboardType: TextInputType.number,
              isPassword: true,
              validator: (v) => v!.length != 4 ? 'Must be exactly 4 digits' : null,
            ),
            const SizedBox(height: 20),
            BillPushButton(
              text: 'Create Employee',
              isLoading: _isLoading,
              onPressed: _submit,
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
