import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../config/constants.dart';

class ApiClient {
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

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
            // Token expired, attempt refresh
            final refreshToken = await _storage.read(key: AppConstants.keyRefreshToken);
            if (refreshToken != null) {
              try {
                // Use a separate dio instance to avoid interceptor loop
                final refreshDio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));
                final response = await refreshDio.post('/auth/refresh', data: {
                  'refresh_token': refreshToken,
                });

                if (response.statusCode == 200 || response.statusCode == 201) {
                  final newAccessToken = response.data['access_token'];
                  final newRefreshToken = response.data['refresh_token'];
                  
                  await _storage.write(key: AppConstants.keyAccessToken, value: newAccessToken);
                  await _storage.write(key: AppConstants.keyRefreshToken, value: newRefreshToken);

                  // Update header and retry original request
                  e.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
                  
                  // Clone original request
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
              } catch (refreshErr) {
                // Refresh token invalid or expired, force logout
                await _storage.deleteAll();
                // We'll let the UI handle navigation via a generic provider listener later
              }
            } else {
               await _storage.deleteAll();
            }
          }

          // Format error message
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
          }

          // Attach custom message to error
          final modifiedError = e.copyWith(error: errorMessage);
          return handler.next(modifiedError);
        },
      ),
    );
  }

  Dio get dio => _dio;
}
