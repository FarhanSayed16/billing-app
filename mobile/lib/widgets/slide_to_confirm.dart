import 'package:flutter/material.dart';
import '../config/theme.dart';
import 'package:flutter/services.dart';

class SlideToConfirmWidget extends StatefulWidget {
  final Future<void> Function() onConfirm;
  final String text;
  final Color baseColor;

  const SlideToConfirmWidget({
    super.key,
    required this.onConfirm,
    this.text = 'Slide to Confirm',
    this.baseColor = AppTheme.successColor,
  });

  @override
  State<SlideToConfirmWidget> createState() => _SlideToConfirmWidgetState();
}

class _SlideToConfirmWidgetState extends State<SlideToConfirmWidget> {
  double _position = 0;
  bool _isConfirmed = false;
  bool _isLoading = false;
  final double _height = 60.0;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final maxSlidingWidth = constraints.maxWidth - _height;
        return Container(
          height: _height,
          decoration: BoxDecoration(
            color: widget.baseColor.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(_height / 2),
          ),
          child: Stack(
            children: [
              Center(
                child: _isLoading 
                  ? const CircularProgressIndicator(color: AppTheme.successColor) 
                  : Text(
                      _isConfirmed ? 'Confirmed' : widget.text,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: widget.baseColor.withValues(alpha: 0.7),
                      ),
                    ),
              ),
              Positioned(
                left: _position,
                child: GestureDetector(
                  onHorizontalDragUpdate: (details) {
                    if (_isConfirmed || _isLoading) return;
                    setState(() {
                      _position += details.delta.dx;
                      if (_position < 0) _position = 0;
                      if (_position > maxSlidingWidth) _position = maxSlidingWidth;
                    });
                  },
                  onHorizontalDragEnd: (details) async {
                    if (_isConfirmed || _isLoading) return;
                    if (_position > maxSlidingWidth * 0.8) {
                      setState(() {
                        _position = maxSlidingWidth;
                        _isConfirmed = true;
                        _isLoading = true;
                      });
                      HapticFeedback.heavyImpact();
                      try {
                        await widget.onConfirm();
                      } finally {
                        if (mounted) {
                           setState(() {
                             _isLoading = false;
                             _isConfirmed = false;
                             _position = 0;
                           });
                        }
                      }
                    } else {
                      setState(() {
                        _position = 0;
                      });
                    }
                  },
                  child: Container(
                    height: _height,
                    width: _height,
                    decoration: BoxDecoration(
                      color: widget.baseColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: widget.baseColor.withValues(alpha: 0.4),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        )
                      ],
                    ),
                    child: const Icon(
                      Icons.arrow_forward_ios,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
