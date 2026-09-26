class AppConstants {
  // Use 10.0.2.2 for Android Emulator, 127.0.0.1 for iOS Simulator/Web
  static const String baseUrl = 'https://billpush-backend.onrender.com/api';

  /// Customer web portal base (Next.js app). Override at build time:
  /// `--dart-define=CUSTOMER_PORTAL_URL=https://your-portal.example`
  static const String customerPortalBaseUrl = String.fromEnvironment(
    'CUSTOMER_PORTAL_URL',
    defaultValue: 'https://bills.billpush.com',
  );

  static String invoicePortalUrl(String billingId) =>
      '$customerPortalBaseUrl/invoice/$billingId';

  static const String keyAccessToken = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUserRole = 'user_role';
  static const String keyUserName = 'user_name';
}
