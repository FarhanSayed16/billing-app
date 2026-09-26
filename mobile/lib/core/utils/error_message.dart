import 'package:dio/dio.dart';

/// Extracts a user-facing message from Dio / unknown errors.
String apiErrorMessage(Object error, [String fallback = 'Something went wrong']) {
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map && data['message'] != null) {
      final msg = data['message'];
      if (msg is List) return msg.join('\n');
      return msg.toString();
    }
    if (error.error != null && error.error.toString().isNotEmpty) {
      return error.error.toString();
    }
    if (error.type == DioExceptionType.connectionError ||
        error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return 'No internet connection';
    }
    return error.message ?? fallback;
  }
  return error.toString().isNotEmpty ? error.toString() : fallback;
}
