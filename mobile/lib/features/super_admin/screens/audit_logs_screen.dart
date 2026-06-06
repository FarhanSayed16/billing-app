import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../providers/api_provider.dart';
import 'package:intl/intl.dart';

class AuditLogsScreen extends ConsumerStatefulWidget {
  const AuditLogsScreen({super.key});

  @override
  ConsumerState<AuditLogsScreen> createState() => _AuditLogsScreenState();
}

class _AuditLogsScreenState extends ConsumerState<AuditLogsScreen> {
  bool _isLoading = true;
  List<dynamic> _logs = [];
  String? _error;
  String _targetTypeFilter = '';
  String _userNameSearch = '';
  DateTime? _startDate;
  DateTime? _endDate;
  
  final TextEditingController _searchController = TextEditingController();

  final List<String> _targetTypes = ['', 'User', 'Store', 'Product', 'Invoice', 'Customer'];

  @override
  void initState() {
    super.initState();
    _fetchLogs();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchLogs() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final dio = ref.read(dioProvider);
      final queryParams = <String, dynamic>{
        'limit': 50,
      };
      if (_targetTypeFilter.isNotEmpty) {
        queryParams['target_type'] = _targetTypeFilter;
      }
      if (_userNameSearch.isNotEmpty) {
        queryParams['user_name'] = _userNameSearch;
      }
      if (_startDate != null) {
        queryParams['date_from'] = _startDate!.toIso8601String();
      }
      if (_endDate != null) {
        // Increment end date by 1 day to include the entire selected day
        queryParams['date_to'] = _endDate!.add(const Duration(days: 1)).toIso8601String();
      }
      
      final response = await dio.get('/audit-logs', queryParameters: queryParams);
      
      setState(() {
        _logs = response.data['data'] ?? [];
        _isLoading = false;
      });
    } on DioException catch (e) {
      setState(() {
        _error = e.response?.data['message'] ?? e.message;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'An unexpected error occurred';
        _isLoading = false;
      });
    }
  }

  IconData _getIconForAction(String action) {
    if (action.contains('CREATED')) return Icons.add_circle;
    if (action.contains('UPDATED') || action.contains('PIN_RESET')) return Icons.edit;
    if (action.contains('DEACTIVATED') || action.contains('VOIDED') || action.contains('REJECTED')) return Icons.cancel;
    if (action.contains('ACTIVATED') || action.contains('APPROVED')) return Icons.check_circle;
    return Icons.info;
  }
  
  Color _getColorForAction(String action) {
    if (action.contains('CREATED')) return Colors.green;
    if (action.contains('UPDATED') || action.contains('PIN_RESET')) return Colors.blue;
    if (action.contains('DEACTIVATED') || action.contains('VOIDED') || action.contains('REJECTED')) return Colors.red;
    if (action.contains('ACTIVATED') || action.contains('APPROVED')) return Colors.teal;
    return Colors.grey;
  }

  Future<void> _selectDateRange() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 1)),
      initialDateRange: _startDate != null && _endDate != null
          ? DateTimeRange(start: _startDate!, end: _endDate!)
          : null,
    );
    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
      });
      _fetchLogs();
    }
  }

  void _clearFilters() {
    setState(() {
      _targetTypeFilter = '';
      _userNameSearch = '';
      _searchController.clear();
      _startDate = null;
      _endDate = null;
    });
    _fetchLogs();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('System Audit Logs'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchLogs,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        decoration: const InputDecoration(
                          labelText: 'Search by User Name',
                          prefixIcon: Icon(Icons.search),
                          border: OutlineInputBorder(),
                        ),
                        onSubmitted: (val) {
                          setState(() {
                            _userNameSearch = val;
                          });
                          _fetchLogs();
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.search),
                      label: const Text('Search'),
                      onPressed: () {
                        setState(() {
                          _userNameSearch = _searchController.text;
                        });
                        _fetchLogs();
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Text('Target Type: '),
                    const SizedBox(width: 8),
                    DropdownButton<String>(
                      value: _targetTypeFilter,
                      items: _targetTypes.map((t) {
                        return DropdownMenuItem(
                          value: t,
                          child: Text(t.isEmpty ? 'All' : t),
                        );
                      }).toList(),
                      onChanged: (val) {
                        setState(() {
                          _targetTypeFilter = val ?? '';
                        });
                        _fetchLogs();
                      },
                    ),
                    const Spacer(),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.date_range),
                      label: Text(_startDate == null ? 'Select Dates' : '${DateFormat('MMM d').format(_startDate!)} - ${DateFormat('MMM d').format(_endDate!)}'),
                      onPressed: _selectDateRange,
                    ),
                    if (_targetTypeFilter.isNotEmpty || _userNameSearch.isNotEmpty || _startDate != null) ...[
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: _clearFilters,
                        child: const Text('Clear Filters'),
                      )
                    ]
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: _buildBody(),
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _fetchLogs,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_logs.isEmpty) {
      return const Center(child: Text('No audit logs found.'));
    }

    return ListView.builder(
      itemCount: _logs.length,
      itemBuilder: (context, index) {
        final log = _logs[index];
        final action = log['action'];
        final targetType = log['target_type'];
        final userName = log['user'] != null ? log['user']['name'] : 'System';
        final createdAt = DateTime.parse(log['created_at']).toLocal();
        final formattedDate = DateFormat('MMM d, yyyy h:mm a').format(createdAt);
        
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          elevation: 2,
          child: ListTile(
            leading: Icon(
              _getIconForAction(action),
              color: _getColorForAction(action),
              size: 32,
            ),
            title: Text(action, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text('By: $userName | Target: $targetType'),
                Text(formattedDate, style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
            isThreeLine: true,
          ),
        );
      },
    );
  }
}
