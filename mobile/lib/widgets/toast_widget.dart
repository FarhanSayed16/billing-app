import 'package:flutter/material.dart';
import '../config/theme.dart';

class BillPushToast {
  static void show(BuildContext context, String message, {bool isError = false}) {
    final color = isError ? AppTheme.errorColor : AppTheme.successColor;
    final icon = isError ? Icons.error_outline : Icons.check_circle_outline;

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white),
            const SizedBox(width: AppTheme.spacingMd),
            Expanded(child: Text(message, style: const TextStyle(color: Colors.white, fontSize: 16))),
          ],
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
        margin: const EdgeInsets.all(AppTheme.spacingMd),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  static void success(BuildContext context, String message) => show(context, message, isError: false);
  static void error(BuildContext context, String message) => show(context, message, isError: true);
}
