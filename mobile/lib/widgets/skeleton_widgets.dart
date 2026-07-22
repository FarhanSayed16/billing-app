import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../config/theme.dart';

class BillPushSkeleton extends StatelessWidget {
  final int lines;
  final bool hasAvatar;
  final int itemCount;

  const BillPushSkeleton({
    super.key,
    this.lines = 3,
    this.hasAvatar = true,
    this.itemCount = 5,
  });

  @override
  Widget build(BuildContext context) {
    bool isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? Colors.grey.shade800 : Colors.grey.shade300,
      highlightColor: isDark ? Colors.grey.shade700 : Colors.grey.shade100,
      child: ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: itemCount,
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        itemBuilder: (context, index) => Padding(
          padding: const EdgeInsets.only(bottom: AppTheme.spacingLg),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (hasAvatar)
                Container(
                  width: 48,
                  height: 48,
                  decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                ),
              if (hasAvatar) const SizedBox(width: AppTheme.spacingMd),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: List.generate(
                    lines,
                    (index) => Container(
                      width: index == lines - 1 ? 150 : double.infinity,
                      height: 12,
                      margin: const EdgeInsets.only(bottom: 8.0),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppTheme.radiusSm)),
                    ),
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
