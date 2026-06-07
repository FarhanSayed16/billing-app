import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../widgets/custom_widgets.dart';
import '../../../providers/api_provider.dart';
import '../../../config/theme.dart';
import 'store_detail_screen.dart';

class StoresListScreen extends ConsumerStatefulWidget {
  const StoresListScreen({super.key});

  @override
  ConsumerState<StoresListScreen> createState() => _StoresListScreenState();
}

class _StoresListScreenState extends ConsumerState<StoresListScreen> {
  List<dynamic> _allStores = [];
  List<dynamic> _filteredStores = [];
  bool _isLoading = true;
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchStores();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchStores() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/stores');
      setState(() {
        _allStores = res.data;
        _filterStores(_searchCtrl.text);
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load stores'), backgroundColor: AppTheme.errorColor),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _filterStores(String query) {
    if (query.isEmpty) {
      setState(() => _filteredStores = List.from(_allStores));
    } else {
      setState(() {
        _filteredStores = _allStores.where((s) => 
          s['name'].toString().toLowerCase().contains(query.toLowerCase()) ||
          s['city'].toString().toLowerCase().contains(query.toLowerCase())
        ).toList();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BillPushAppBar(title: 'Stores Management', showBackButton: false),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Search stores...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onChanged: _filterStores,
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _fetchStores,
                    child: _filteredStores.isEmpty
                        ? ListView(children: const [SizedBox(height: 100), Center(child: Text('No stores found'))])
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _filteredStores.length,
                            itemBuilder: (context, index) {
                              final store = _filteredStores[index];
                              return Card(
                                margin: const EdgeInsets.only(bottom: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                child: ListTile(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => StoreDetailScreen(storeId: store['id']))
                                    ).then((_) => _fetchStores());
                                  },
                                  leading: CircleAvatar(
                                    backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                                    backgroundImage: store['logo_url'] != null ? NetworkImage(store['logo_url']) : null,
                                    child: store['logo_url'] == null ? const Icon(Icons.store, color: AppTheme.primaryColor) : null,
                                  ),
                                  title: Text(store['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                                  subtitle: Text('${store['city']} • ${store['employee_count']} Staff\nToday\'s Revenue: ₹${store['today_revenue']}'),
                                  isThreeLine: true,
                                  trailing: Icon(
                                    Icons.circle,
                                    size: 12,
                                    color: store['is_active'] ? AppTheme.successColor : AppTheme.errorColor,
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
          )
        ],
      ),
    );
  }
}
