import 'package:flutter/material.dart';
import '../config/theme.dart';

class BillPushEmptyState extends StatelessWidget {
  final String title;
  final String? subtitle;
  // A clean, simple "nothing here" generic animation from Lottie
  final String lottieUrl;

  const BillPushEmptyState({
    super.key,
    required this.title,
    this.subtitle,
    this.lottieUrl = 'https://assets9.lottiefiles.com/packages/lf20_ttvtey45.json',
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacingXl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Icon(
              Icons.inventory_2_outlined, 
              size: 80, 
              color: Colors.grey
            ),
            const SizedBox(height: AppTheme.spacingLg),
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: AppTheme.spacingSm),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ]
          ],
        ),
      ),
    );
  }
}
