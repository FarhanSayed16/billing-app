
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/store_setup_screen.dart';
import '../../features/dashboard/super_admin_dashboard.dart';
import '../../features/dashboard/store_admin_dashboard.dart';
import '../../features/employee/screens/pos_home_screen.dart';
import '../../features/employee/screens/customer_entry_screen.dart';
import '../../features/employee/screens/cart_screen.dart';
import '../../features/employee/screens/checkout_screen.dart';
import '../../features/employee/screens/success_screen.dart';
import '../../features/employee/screens/recent_bills_screen.dart';
import '../../features/store_admin/screens/invoice_detail_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isAuth = authState.status == AuthStatus.authenticated;
      final isInitial = authState.status == AuthStatus.initial;
      final isGoingToLogin = state.matchedLocation == '/login';
      final isGoingToRegister = state.matchedLocation == '/register';

      if (isInitial) return null;

      if (!isAuth && !isGoingToLogin && !isGoingToRegister) {
        return '/login';
      }

      if (isAuth && (isGoingToLogin || state.matchedLocation == '/')) {
        if (authState.role == 'SUPER_ADMIN') return '/super-admin';
        if (authState.role == 'STORE_ADMIN') return '/store-admin';
        if (authState.role == 'EMPLOYEE') return '/employee/pos';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/setup-store',
        builder: (context, state) => const StoreSetupScreen(),
      ),
      GoRoute(
        path: '/super-admin',
        builder: (context, state) => const SuperAdminDashboard(),
        redirect: (context, state) => authState.role != 'SUPER_ADMIN' ? '/login' : null,
      ),
      GoRoute(
        path: '/store-admin',
        builder: (context, state) => const StoreAdminDashboard(),
        redirect: (context, state) => authState.role != 'STORE_ADMIN' ? '/login' : null,
      ),
      GoRoute(
        path: '/employee/pos',
        builder: (context, state) => const PosHomeScreen(),
        redirect: (context, state) => authState.role != 'EMPLOYEE' ? '/login' : null,
        routes: [
           GoRoute(path: 'customer', builder: (context, state) => const CustomerEntryScreen()),
           GoRoute(path: 'cart', builder: (context, state) => const CartScreen()),
           GoRoute(path: 'checkout', builder: (context, state) => const CheckoutScreen()),
           GoRoute(path: 'recent', builder: (context, state) => const RecentBillsScreen()),
           GoRoute(path: 'success', builder: (context, state) => SuccessScreen(invoiceData: state.extra as Map<String, dynamic>)),
           GoRoute(path: 'invoice', builder: (context, state) => InvoiceDetailScreen(invoiceId: state.extra as String)),
        ]
      ),
    ],
  );
});
