import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../config/theme.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, dynamic>> _onboardingData = [
    {
      "title": "Welcome to BillPush",
      "subtitle": "Discover a new era of digital billing designed for speed and simplicity.",
      "icon": Icons.receipt_long_rounded,
    },
    {
      "title": "Instant Digital Billing",
      "subtitle": "Generate and share PDF receipts via WhatsApp natively in seconds. Say goodbye to paper.",
      "icon": Icons.flash_on_rounded,
    },
    {
      "title": "Customers Love It",
      "subtitle": "Provide your customers with a beautiful portal to track their purchase history.",
      "icon": Icons.people_alt_rounded,
    },
  ];

  Future<void> _completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('hasSeenOnboarding', true);
    if (mounted) {
      context.go('/login');
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLastPage = _currentPage == _onboardingData.length - 1;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Skip button row — always present, fixed height
            SizedBox(
              height: 56,
              child: !isLastPage
                  ? Align(
                      alignment: Alignment.centerRight,
                      child: Padding(
                        padding: const EdgeInsets.only(right: 16.0),
                        child: TextButton(
                          onPressed: _completeOnboarding,
                          child: const Text(
                            'Skip',
                            style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    )
                  : null,
            ),
            // PageView content
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                physics: const ClampingScrollPhysics(),
                onPageChanged: (value) {
                  setState(() => _currentPage = value);
                },
                itemCount: _onboardingData.length,
                itemBuilder: (context, index) {
                  final data = _onboardingData[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 180,
                          height: 180,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            data['icon'] as IconData,
                            size: 80,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        const SizedBox(height: 48),
                        Text(
                          data['title'] as String,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          data['subtitle'] as String,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            // Bottom navigation bar
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Page indicators
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      _onboardingData.length,
                      (index) => AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        height: 8,
                        width: _currentPage == index ? 24 : 8,
                        decoration: BoxDecoration(
                          color: _currentPage == index
                              ? AppTheme.primaryColor
                              : Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Full-width button (works WITH the theme's infinite minimumSize)
                  ElevatedButton(
                    onPressed: () {
                      if (isLastPage) {
                        _completeOnboarding();
                      } else {
                        _pageController.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeIn,
                        );
                      }
                    },
                    child: Text(isLastPage ? 'Get Started' : 'Next'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
