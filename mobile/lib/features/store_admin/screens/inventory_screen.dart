import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/api_provider.dart';
import '../../../config/theme.dart';
import '../../../widgets/toast_widget.dart';

class InventoryScreen extends ConsumerStatefulWidget {
  const InventoryScreen({super.key});

  @override
  ConsumerState<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends ConsumerState<InventoryScreen> {
  bool _isLoading = true;
  List<dynamic> _inventory = [];

  @override
  void initState() {
    super.initState();
    _fetchInventory();
  }

  Future<void> _fetchInventory() async {
    try {
      setState(() => _isLoading = true);
      final dio = ref.read(dioProvider);
      final response = await dio.get('/inventory/mine');
      if (mounted) {
        setState(() {
          _inventory = response.data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        BillPushToast.error(context, 'Failed to fetch inventory');
      }
    }
  }

  Future<void> _adjustStock(String productId, String productName, int currentQuantity) async {
    final qtyController = TextEditingController(text: currentQuantity.toString());
    final reasonController = TextEditingController();
    
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Adjust Stock: $productName'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: qtyController,
              decoration: const InputDecoration(labelText: 'New Quantity'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(labelText: 'Reason (e.g. Counted, Damaged)'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Update'),
          ),
        ],
      ),
    );

    if (result == true) {
      final qty = int.tryParse(qtyController.text);
      if (qty == null) return;
      
      try {
        final dio = ref.read(dioProvider);
        await dio.patch('/inventory/mine/$productId', data: {
          'quantity': qty,
          'reason': reasonController.text.isEmpty ? 'Manual adjustment' : reasonController.text,
        });
        if (mounted) {
          BillPushToast.success(context, 'Stock updated successfully');
        }
        _fetchInventory();
      } catch (e) {
        if (mounted) {
          BillPushToast.error(context, 'Failed to update stock');
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inventory Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchInventory,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _inventory.isEmpty
              ? const Center(child: Text('No products found'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _inventory.length,
                  itemBuilder: (context, index) {
                    final item = _inventory[index];
                    final isLowStock = item['status'] == 'LOW_STOCK';
                    final isOutOfStock = item['status'] == 'OUT_OF_STOCK';
                    
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: isOutOfStock 
                              ? Colors.red.withValues(alpha: 0.1) 
                              : isLowStock 
                                  ? Colors.orange.withValues(alpha: 0.1) 
                                  : AppTheme.primaryColor.withValues(alpha: 0.1),
                          child: Icon(
                            isOutOfStock ? Icons.warning : Icons.inventory,
                            color: isOutOfStock ? Colors.red : isLowStock ? Colors.orange : AppTheme.primaryColor,
                          ),
                        ),
                        title: Text(item['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('SKU: ${item['sku'] ?? 'N/A'} | Category: ${item['category'] ?? 'N/A'}'),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '${item['quantity']}', 
                              style: TextStyle(
                                fontSize: 18, 
                                fontWeight: FontWeight.bold,
                                color: isOutOfStock ? Colors.red : isLowStock ? Colors.orange : AppTheme.successColor,
                              )
                            ),
                            Text(
                              isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock',
                              style: TextStyle(
                                fontSize: 10,
                                color: isOutOfStock ? Colors.red : isLowStock ? Colors.orange : AppTheme.successColor,
                              ),
                            ),
                          ],
                        ),
                        onTap: () => _adjustStock(item['id'], item['name'], item['quantity']),
                      ),
                    );
                  },
                ),
    );
  }
}
