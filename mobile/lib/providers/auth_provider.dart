import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../config/constants.dart';

enum AuthStatus { initial, authenticated, unauthenticated }

class AuthState {
  final AuthStatus status;
  final String? role;

  AuthState({required this.status, this.role});

  AuthState copyWith({AuthStatus? status, String? role}) {
    return AuthState(
      status: status ?? this.status,
      role: role ?? this.role,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  @override
  AuthState build() {
    checkToken();
    return AuthState(status: AuthStatus.initial);
  }

  Future<void> checkToken() async {
    final token = await _storage.read(key: AppConstants.keyAccessToken);
    final role = await _storage.read(key: AppConstants.keyUserRole);
    if (token != null && role != null) {
      state = state.copyWith(status: AuthStatus.authenticated, role: role);
    } else {
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> loginSuccess(String accessToken, String? refreshToken, String role, String name) async {
    await _storage.write(key: AppConstants.keyAccessToken, value: accessToken);
    if (refreshToken != null) {
      await _storage.write(key: AppConstants.keyRefreshToken, value: refreshToken);
    }
    await _storage.write(key: AppConstants.keyUserRole, value: role);
    await _storage.write(key: AppConstants.keyUserName, value: name);
    state = state.copyWith(status: AuthStatus.authenticated, role: role);
  }

  Future<void> logout() async {
    await _storage.deleteAll();
    state = state.copyWith(status: AuthStatus.unauthenticated, role: null);
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
