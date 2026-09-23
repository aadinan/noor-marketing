import 'package:flutter/material.dart';
import '../services/inventory_service.dart';

class InventoryListScreen extends StatefulWidget {
  const InventoryListScreen({super.key});

  @override
  State<InventoryListScreen> createState() => _InventoryListScreenState();
}

class _InventoryListScreenState extends State<InventoryListScreen> {
  final InventoryService _inventoryService = InventoryService();
  late Future<List<dynamic>> _inventoryFuture;

  @override
  void initState() {
    super.initState();
    _inventoryFuture = _inventoryService.fetchInventory();
  }

  void _refresh() {
    setState(() {
      _inventoryFuture = _inventoryService.fetchInventory();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inventory Master List'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refresh,
          )
        ],
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _inventoryFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final items = snapshot.data ?? [];

          if (items.isEmpty) {
            return const Center(child: Text('No inventory items found.'));
          }

          return ListView.separated(
            itemCount: items.length,
            separatorBuilder: (context, index) => const Divider(),
            itemBuilder: (context, index) {
              final product = items[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.blueGrey,
                  child: Text(
                    product['name'] != null ? product['name'].substring(0, 1).toUpperCase() : 'P',
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
                title: Text(product['name'] ?? 'Unknown Product', style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('Barcode: ${product['barcode'] ?? 'N/A'}'),
                trailing: Text(
                  'Qty: ${product['quantity'] ?? 0}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.green),
                ),
                onTap: () {
                  // Can expand to edit item, etc.
                }
              );
            },
          );
        },
      ),
    );
  }
}
