import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../providers/api_provider.dart';
import '../../../config/theme.dart';

class EmployeesScreen extends ConsumerStatefulWidget {
  const EmployeesScreen({super.key});

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
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(!isActive ? 'Employee Activated' : 'Employee Deactivated'), backgroundColor: AppTheme.successColor),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update status'), backgroundColor: AppTheme.errorColor),
        );
      }
    }
  }

  void _showResetPinSheet(String empId, String empName) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => _ResetPinForm(empId: empId, empName: empName),
    );
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
                          child: Dismissible(
                            key: Key(emp['id']),
                            direction: DismissDirection.endToStart,
                            background: Container(
                              alignment: Alignment.centerRight,
                              padding: const EdgeInsets.only(right: 20),
                              decoration: BoxDecoration(color: isActive ? AppTheme.errorColor : AppTheme.successColor, borderRadius: BorderRadius.circular(12)),
                              child: Icon(isActive ? Icons.person_off : Icons.person, color: Colors.white),
                            ),
                            confirmDismiss: (direction) async {
                              _toggleStatus(emp['id'], isActive);
                              return false; // Prevent actual removal from tree
                            },
                            child: ListTile(
                              onTap: () => _showResetPinSheet(emp['id'], emp['name']),
                              leading: CircleAvatar(
                                backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                                child: Text(emp['name'].substring(0, 1).toUpperCase()),
                              ),
                              title: Text(emp['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('${emp['phone'] ?? 'No phone'}\nLast Login: N/A'),
                              isThreeLine: true,
                              trailing: Icon(
                                Icons.circle,
                                size: 12,
                                color: isActive ? AppTheme.successColor : AppTheme.errorColor,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}

class _ResetPinForm extends ConsumerStatefulWidget {
  final String empId;
  final String empName;
  const _ResetPinForm({required this.empId, required this.empName});

  @override
  ConsumerState<_ResetPinForm> createState() => _ResetPinFormState();
}

class _ResetPinFormState extends ConsumerState<_ResetPinForm> {
  final _formKey = GlobalKey<FormState>();
  final _pinCtrl = TextEditingController();
  bool _isLoading = false;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioProvider);
      await dio.patch('/employees/${widget.empId}/reset-pin', data: {
        'new_pin': _pinCtrl.text.trim(),
      });
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('PIN Reset Successful'), backgroundColor: AppTheme.successColor));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to reset PIN'), backgroundColor: AppTheme.errorColor));
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
            Text('Reset PIN for ${widget.empName}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            BillPushTextField(
              label: 'New 4-Digit PIN',
              controller: _pinCtrl,
              keyboardType: TextInputType.number,
              isPassword: true,
              validator: (v) => v!.length != 4 ? 'Must be exactly 4 digits' : null,
            ),
            const SizedBox(height: 20),
            BillPushButton(
              text: 'Reset PIN',
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
