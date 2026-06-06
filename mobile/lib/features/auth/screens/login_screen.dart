import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../config/theme.dart';
import '../../../providers/api_provider.dart';
import '../../../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 40),
            Icon(Icons.shopping_cart, size: 48, color: AppTheme.primaryColor),
            const SizedBox(height: 8),
            Center(
              child: Text(
                'BillPush',
                style: Theme.of(context).textTheme.displayMedium?.copyWith(
                  color: AppTheme.primaryColor,
                ),
              ),
            ),
            const SizedBox(height: 24),
            TabBar(
              controller: _tabController,
              labelColor: AppTheme.primaryColor,
              unselectedLabelColor: AppTheme.textSecondaryColor,
              indicatorColor: AppTheme.primaryColor,
              tabs: const [
                Tab(text: 'Staff Login'),
                Tab(text: 'Admin Login'),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: const [
                  _EmployeeLoginTab(),
                  _AdminLoginTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Admin Login Tab ─────────────────────────────────────────
class _AdminLoginTab extends ConsumerStatefulWidget {
  const _AdminLoginTab();

  @override
  ConsumerState<_AdminLoginTab> createState() => _AdminLoginTabState();
}

class _AdminLoginTabState extends ConsumerState<_AdminLoginTab> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _isLoading = false;
  bool _obscurePass = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (_emailCtrl.text.trim().isEmpty || _passCtrl.text.isEmpty) return;
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.post('/auth/login', data: {
        'email': _emailCtrl.text.trim(),
        'password': _passCtrl.text,
      });

      final accessToken = res.data['access_token'];
      final refreshToken = res.data['refresh_token'];
      final user = res.data['user'];

      await ref.read(authProvider.notifier).loginSuccess(
        accessToken, 
        refreshToken, 
        user['role'], 
        user['name']
      );

      if (!mounted) return;
      if (user['role'] == 'STORE_ADMIN' && user['store'] == null) {
        context.go('/setup-store');
      } else {
        if (user['role'] == 'SUPER_ADMIN') {
          context.go('/super-admin');
        } else {
          context.go('/store-admin');
        }
      }

    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.error?.toString() ?? 'Login failed'), backgroundColor: AppTheme.errorColor)
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
          BillPushTextField(
            label: 'Email',
            controller: _emailCtrl,
            keyboardType: TextInputType.emailAddress,
            prefixIcon: const Icon(Icons.email_outlined),
          ),
          BillPushTextField(
            label: 'Password',
            controller: _passCtrl,
            isPassword: _obscurePass,
            prefixIcon: const Icon(Icons.lock_outline),
            suffixIcon: IconButton(
              icon: Icon(_obscurePass ? Icons.visibility_off : Icons.visibility),
              onPressed: () => setState(() => _obscurePass = !_obscurePass),
            ),
          ),
          const SizedBox(height: 20),
          BillPushButton(
            text: 'Login',
            isLoading: _isLoading,
            onPressed: _login,
          ),
          TextButton(
            onPressed: () => context.push('/register'),
            child: const Text('Register as Store Manager'),
          )
        ],
      ),
    ));
  }
}

// ─── Employee Login Tab ──────────────────────────────────────
class _EmployeeLoginTab extends ConsumerStatefulWidget {
  const _EmployeeLoginTab();

  @override
  ConsumerState<_EmployeeLoginTab> createState() => _EmployeeLoginTabState();
}

class _EmployeeLoginTabState extends ConsumerState<_EmployeeLoginTab> {
  List<Map<String, dynamic>> _stores = [];
  List<Map<String, dynamic>> _employees = [];
  String? _selectedStoreId;
  String? _selectedEmployeeId;
  String _pin = '';

  @override
  void initState() {
    super.initState();
    _fetchStores();
  }

  Future<void> _fetchStores() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/stores/public');
      if (mounted) {
        setState(() {
          _stores = List<Map<String, dynamic>>.from(res.data);
        });
      }
    } catch (_) {
      // Handle gracefully
    }
  }

  Future<void> _fetchEmployees(String storeId) async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/employees/login-list/$storeId');
      setState(() {
        _employees = List<Map<String, dynamic>>.from(res.data);
        _selectedEmployeeId = null;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not load employees'), backgroundColor: AppTheme.errorColor)
        );
      }
    }
  }

  Future<void> _login() async {
    if (_selectedStoreId == null || _selectedEmployeeId == null || _pin.length < 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select store, employee, and enter PIN'))
      );
      return;
    }

    try {
      final res = await ref.read(dioProvider).post('/auth/employee-login', data: {
        'store_id': _selectedStoreId,
        'employee_id': _selectedEmployeeId,
        'pin': _pin,
      });

      final accessToken = res.data['access_token'];
      final user = res.data['user'];

      await ref.read(authProvider.notifier).loginSuccess(
        accessToken, 
        null,
        user['role'], 
        user['name']
      );

      // The authProvider state change might trigger a redirect automatically,
      // but if we explicitly route, it MUST be the correct absolute path.
      if (mounted) context.go('/employee/pos');
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.error?.toString() ?? 'Login failed'), backgroundColor: AppTheme.errorColor)
        );
        setState(() => _pin = '');
      }
    } finally {
      // Done
    }
  }

  void _onPinTap(String val) {
    if (_pin.length < 4) {
      setState(() => _pin += val);
      // Auto-login on 4th digit
      if (_pin.length == 4) {
        Future.delayed(const Duration(milliseconds: 200), _login);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          if (_stores.isEmpty)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: CircularProgressIndicator(),
            )
          else
            DropdownButtonFormField<String>(
              initialValue: _selectedStoreId,
              decoration: const InputDecoration(labelText: 'Select Store', prefixIcon: Icon(Icons.store_outlined)),
              items: _stores.map((s) => DropdownMenuItem(value: s['id'] as String, child: Text(s['name'] as String))).toList(),
              onChanged: (v) {
                if (v != null) {
                  setState(() {
                    _selectedStoreId = v;
                    _selectedEmployeeId = null;
                    _pin = '';
                    _employees = [];
                  });
                  _fetchEmployees(v);
                }
              },
            ),
          if (_employees.isNotEmpty) ...[
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              initialValue: _selectedEmployeeId,
              decoration: const InputDecoration(labelText: 'Select Employee', prefixIcon: Icon(Icons.person_outlined)),
              items: _employees.map((e) => DropdownMenuItem(value: e['id'] as String, child: Text(e['name'] as String))).toList(),
              onChanged: (v) => setState(() {
                _selectedEmployeeId = v;
                _pin = '';
              }),
            ),
          ],
          const SizedBox(height: 20),
          // PIN display
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(4, (i) => Container(
              width: 48, height: 48,
              margin: const EdgeInsets.symmetric(horizontal: 8),
              decoration: BoxDecoration(
                border: Border.all(color: i < _pin.length ? AppTheme.primaryColor : Colors.grey.shade300, width: 2),
                borderRadius: BorderRadius.circular(12),
                color: i < _pin.length ? AppTheme.primaryColor.withValues(alpha: 0.1) : Colors.white,
              ),
              child: Center(
                child: Text(
                  i < _pin.length ? '●' : '',
                  style: TextStyle(fontSize: 24, color: AppTheme.primaryColor),
                ),
              ),
            )),
          ),
          const SizedBox(height: 20),
          // Number pad
          Expanded(
            child: GridView.count(
              crossAxisCount: 3,
              childAspectRatio: 1.6,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                for (var i = 1; i <= 9; i++)
                  _PinButton(label: '$i', onTap: () => _onPinTap('$i')),
                _PinButton(label: 'C', onTap: () => setState(() => _pin = ''), isSpecial: true),
                _PinButton(label: '0', onTap: () => _onPinTap('0')),
                _PinButton(icon: Icons.backspace_outlined, onTap: () {
                  if (_pin.isNotEmpty) setState(() => _pin = _pin.substring(0, _pin.length - 1));
                }, isSpecial: true),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PinButton extends StatelessWidget {
  final String? label;
  final IconData? icon;
  final VoidCallback onTap;
  final bool isSpecial;

  const _PinButton({this.label, this.icon, required this.onTap, this.isSpecial = false});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isSpecial ? Colors.grey.shade100 : Colors.white,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Center(
          child: icon != null
              ? Icon(icon, size: 24, color: isSpecial ? AppTheme.errorColor : AppTheme.textPrimaryColor)
              : Text(
                  label ?? '',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w600,
                    color: isSpecial ? AppTheme.errorColor : AppTheme.textPrimaryColor,
                  ),
                ),
        ),
      ),
    );
  }
}
