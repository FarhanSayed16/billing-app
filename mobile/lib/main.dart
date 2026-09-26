import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/router/app_router.dart';
import 'core/storage/hive_service.dart';
import 'core/network/sync_service.dart';
import 'config/theme.dart';
import 'providers/api_provider.dart';
import 'providers/auth_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await HiveService.init();

  // Preload theme fonts so TextFields don't rebuild/reset selection mid-edit
  // when Google Fonts finishes downloading.
  final _ = AppTheme.lightTheme;
  try {
    await GoogleFonts.pendingFonts();
  } catch (_) {}

  // Firebase is optional — app continues if google-services / plist is missing.
  try {
    await Firebase.initializeApp();
  } catch (_) {
    // Push notifications remain disabled until Firebase is configured.
  }

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerStatefulWidget {
  const MyApp({super.key});

  @override
  ConsumerState<MyApp> createState() => _MyAppState();
}

class _MyAppState extends ConsumerState<MyApp> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final apiClient = ref.read(apiClientProvider);
      SyncService.init(apiClient.dio);
      apiClient.onSessionExpired = () async {
        await ref.read(authProvider.notifier).logout();
      };
      _registerFcmToken();
    });
  }

  Future<void> _registerFcmToken() async {
    try {
      if (Firebase.apps.isEmpty) return;
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission();
      final token = await messaging.getToken();
      if (token == null) return;

      final auth = ref.read(authProvider);
      if (auth.status != AuthStatus.authenticated) return;

      await ref.read(dioProvider).patch('/auth/fcm-token', data: {'fcm_token': token});
    } catch (_) {
      // Ignore FCM registration failures (no Firebase config / not logged in).
    }
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);

    ref.listen<AuthState>(authProvider, (prev, next) {
      if (next.status == AuthStatus.authenticated &&
          prev?.status != AuthStatus.authenticated) {
        _registerFcmToken();
      }
    });

    return MaterialApp.router(
      title: 'BillPush',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
    );
  }
}
