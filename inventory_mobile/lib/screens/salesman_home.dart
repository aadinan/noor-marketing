import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/auth_service.dart';
import 'inventory_list_screen.dart';
import 'cart_screen.dart';
import 'collection_screen.dart';
import 'delivery_list_screen.dart';
import 'eod_tally_screen.dart';
import 'shop_management_screen.dart';
import '../services/offline_sync_service.dart';

class SalesmanHome extends StatelessWidget {
  const SalesmanHome({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Salesman Dashboard"),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              showDialog(
                context: context,
                builder: (BuildContext context) {
                  return AlertDialog(
                    title: const Text("Confirm Logout"),
                    content: const Text("Are you sure you want to log out of the portal?"),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text("Cancel"),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).pop();
                          context.read<AuthService>().logout();
                        },
                        child: const Text("Logout", style: TextStyle(color: Colors.red)),
                      ),
                    ],
                  );
                },
              );
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              "Welcome to the Sales Portal!",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
            ElevatedButton.icon(
              icon: const Icon(Icons.store),
              label: const Text("Shop Management"),
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(20)),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const ShopManagementScreen()),
                );
              },
            ),
            const SizedBox(height: 10),
            ElevatedButton.icon(
              icon: const Icon(Icons.inventory),
              label: const Text("Browse Catalog"),
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(20)),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const InventoryListScreen()),
                );
              },
            ),
            const SizedBox(height: 10),
            ElevatedButton.icon(
              icon: const Icon(Icons.shopping_cart),
              label: const Text("Fast Cart (Offline Mode)"),
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(20)),
              onPressed: () async {
                final selectedRetailer = await Navigator.push<Map<String, dynamic>>(
                  context,
                  MaterialPageRoute(builder: (context) => const ShopManagementScreen(isSelecting: true)),
                );
                if (selectedRetailer != null && context.mounted) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => CartScreen(retailer: selectedRetailer)),
                  );
                }
              },
            ),
            const SizedBox(height: 10),
            ElevatedButton.icon(
              icon: const Icon(Icons.payment),
              label: const Text("Collection Recorder"),
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(20), backgroundColor: Colors.green, foregroundColor: Colors.white),
              onPressed: () async {
                final selectedRetailer = await Navigator.push<Map<String, dynamic>>(
                  context,
                  MaterialPageRoute(builder: (context) => const ShopManagementScreen(isSelecting: true)),
                );
                if (selectedRetailer != null && context.mounted) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => CollectionScreen(
                        retailerId: selectedRetailer['id'] ?? selectedRetailer['_id'] ?? '',
                        shopName: selectedRetailer['shopName'] ?? 'Shop',
                      ),
                    ),
                  );
                }
              },
            ),
            const SizedBox(height: 10),
            ElevatedButton.icon(
              icon: const Icon(Icons.local_shipping),
              label: const Text("My Delivery Route"),
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(20)),
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => const DeliveryListScreen()));
              },
            ),
            const SizedBox(height: 10),
            ElevatedButton.icon(
              icon: const Icon(Icons.verified),
              label: const Text("EOD Tally"),
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(20), backgroundColor: Colors.purple, foregroundColor: Colors.white),
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => const EODTallyScreen()));
              },
            ),
            const Spacer(),
            ElevatedButton.icon(
              icon: const Icon(Icons.sync),
              label: const Text("Force Sync Offline Data"),
              onPressed: () async {
                final messenger = ScaffoldMessenger.of(context);
                messenger.showSnackBar(const SnackBar(content: Text('Syncing data to server...')));
                await OfflineSyncService().syncAllData();
                messenger.showSnackBar(const SnackBar(content: Text('Sync complete!')));
              },
            )
          ],
        ),
      ),
    );
  }
}
