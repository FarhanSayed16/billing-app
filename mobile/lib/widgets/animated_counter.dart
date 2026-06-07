import 'package:flutter/material.dart';

class AnimatedCounter extends StatelessWidget {
  final double value;
  final TextStyle? style;
  final String prefix;
  final String suffix;
  final Duration duration;
  final int fractionDigits;

  const AnimatedCounter({
    super.key,
    required this.value,
    this.style,
    this.prefix = '',
    this.suffix = '',
    this.duration = const Duration(milliseconds: 1500),
    this.fractionDigits = 0,
  });

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: value),
      duration: duration,
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        final formattedValue = value.toStringAsFixed(fractionDigits);
        // add commas for formatting
        final parts = formattedValue.split('.');
        String matchFunc(Match match) => '${match[1]},';
        
        // Custom Indian comma formatting if needed, but standard grouping is enough for MVP
        var intPart = parts[0];
        if (intPart.length > 3) {
          final lastThree = intPart.substring(intPart.length - 3);
          final otherNumbers = intPart.substring(0, intPart.length - 3);
          if (otherNumbers.isNotEmpty) {
            intPart = '${otherNumbers.replaceAllMapped(RegExp(r'(\d{1,2})(?=(\d{2})+(?!\d))'), matchFunc)},$lastThree';
          }
        }
        
        final finalVal = parts.length > 1 ? '$intPart.${parts[1]}' : intPart;
        
        return Text(
          '$prefix$finalVal$suffix',
          style: style,
        );
      },
    );
  }
}
