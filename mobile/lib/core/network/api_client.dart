import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../config/constants.dart';

typedef SessionExpiredCallback = Future<void> Function();

class ApiClient {
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  SessionExpiredCallback? onSessionExpired;

  ApiClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: AppConstants.keyAccessToken);
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            final refreshToken = await _storage.read(key: AppConstants.keyRefreshToken);
            if (refreshToken != null) {
              try {
                final refreshDio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));
                final response = await refreshDio.post('/auth/refresh', data: {
                  'refresh_token': refreshToken,
                });

                if (response.statusCode == 200 || response.statusCode == 201) {
                  final newAccessToken = response.data['access_token'];
                  final newRefreshToken = response.data['refresh_token'];

                  await _storage.write(key: AppConstants.keyAccessToken, value: newAccessToken);
                  await _storage.write(key: AppConstants.keyRefreshToken, value: newRefreshToken);

                  e.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';

                  try {
                    final cloneReq = await _dio.request(
                      e.requestOptions.path,
                      options: Options(
                        method: e.requestOptions.method,
                        headers: e.requestOptions.headers,
                      ),
                      data: e.requestOptions.data,
                      queryParameters: e.requestOptions.queryParameters,
                    );
                    return handler.resolve(cloneReq);
                  } catch (cloneErr) {
                    return handler.reject(cloneErr as DioException);
                  }
                }
              } catch (_) {
                await _forceLogout();
              }
            } else {
              await _forceLogout();
            }
          }

          String errorMessage = 'An unexpected error occurred';
          if (e.response != null && e.response?.data != null) {
            if (e.response?.data is Map && e.response?.data['message'] != null) {
              final msg = e.response?.data['message'];
              if (msg is List) {
                errorMessage = msg.join('\n');
              } else {
                errorMessage = msg.toString();
              }
            }
          } else if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout) {
            errorMessage = 'Connection timed out';
          } else if (e.type == DioExceptionType.connectionError) {
            errorMessage = 'No internet connection';
          }

          final modifiedError = e.copyWith(error: errorMessage);
          return handler.next(modifiedError);
        },
      ),
    );
  }

  Future<void> _forceLogout() async {
    await _storage.deleteAll();
    final cb = onSessionExpired;
    if (cb != null) {
      await cb();
    }
  }

  Dio get dio => _dio;
}
