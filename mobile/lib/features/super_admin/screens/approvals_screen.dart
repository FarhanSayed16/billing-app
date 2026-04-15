import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../providers/api_provider.dart';
import '../../../config/theme.dart';

class ApprovalsScreen extends ConsumerStatefulWidget {
  const ApprovalsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ApprovalsScreen> createState() => _ApprovalsScreenState();
}

class _ApprovalsScreenState extends ConsumerState<ApprovalsScreen> {
  List<dynamic> _pendingList = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchPendingRegistrations();
  }

  Future<void> _fetchPendingRegistrations() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/auth/pending-registrations');
      setState(() {
        _pendingList = res.data;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load approvals'), backgroundColor: AppTheme.errorColor),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _processApproval(String userId, bool isApprove) async {
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioProvider);
      final endpoint = isApprove ? '/auth/approve/$userId' : '/auth/reject/$userId';
      await dio.patch(endpoint);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(isApprove ? 'Store Admin Approved' : 'Store Admin Rejected'), 
            backgroundColor: isApprove ? AppTheme.successColor : AppTheme.errorColor
          ),
        );
        _fetchPendingRegistrations();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Action failed'), backgroundColor: AppTheme.errorColor),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Pending Approvals', showBackButton: false),
      body: _isLoading && _pendingList.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchPendingRegistrations,
              child: _pendingList.isEmpty
                  ? ListView(
                      children: const [
                        SizedBox(height: 100),
                        Center(child: Text('No pending approvals')),
                      ],
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _pendingList.length,
                      itemBuilder: (context, index) {
                        final user = _pendingList[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          elevation: 2,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(user['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                const SizedBox(height: 8),
                                Row(children: [
                                  const Icon(Icons.email_outlined, size: 16, color: Colors.grey),
                                  const SizedBox(width: 8),
                                  Text(user['email']),
                                ]),
                                const SizedBox(height: 4),
                                Row(children: [
                                  const Icon(Icons.phone_outlined, size: 16, color: Colors.grey),
                                  const SizedBox(width: 8),
                                  Text(user['phone'] ?? 'N/A'),
                                ]),
                                const SizedBox(height: 16),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    OutlinedButton(
                                      onPressed: () => _processApproval(user['id'], false),
                                      style: OutlinedButton.styleFrom(foregroundColor: AppTheme.errorColor),
                                      child: const Text('Reject'),
                                    ),
                                    const SizedBox(width: 12),
                                    ElevatedButton(
                                      onPressed: () => _processApproval(user['id'], true),
                                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.successColor),
                                      child: const Text('Approve'),
                                    ),
                                  ],
                                )
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
