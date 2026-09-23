import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DeliveryListScreen extends StatefulWidget {
  const DeliveryListScreen({super.key});

  @override
  State<DeliveryListScreen> createState() => _DeliveryListScreenState();
}

class _DeliveryListScreenState extends State<DeliveryListScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _pendingDeliveries = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchDeliveries();
  }

  void _fetchDeliveries() async {
    try {
      // In a real app, this might come from SQLite if fully offline. Here we demo the online auto-removal.
      final res = await _apiService.getRequest('/orders?status=Out for Delivery');
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body);
        setState(() {
          _pendingDeliveries = decoded['data'] ?? decoded;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _markDelivered(String orderId) async {
    // Optimistic UI updates
    setState(() {
      _pendingDeliveries.removeWhere((o) => o['_id'] == orderId);
    });
    try {
       await _apiService.putRequest('/orders/$orderId/status', {'status': 'Delivered'});
       if (!mounted) return;
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Delivered successfully!")));
    } catch (e) {
       if (!mounted) return;
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Failed to update status")));
       _fetchDeliveries(); // Restore if failed
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    
    return Scaffold(
      appBar: AppBar(title: const Text("My Delivery Route")),
      body: _pendingDeliveries.isEmpty 
        ? const Center(child: Text("No deliveries remaining! You're done! 🎉"))
        : ListView.builder(
            itemCount: _pendingDeliveries.length,
            itemBuilder: (context, i) {
              final val = _pendingDeliveries[i];
              return Card(
                margin: const EdgeInsets.all(8),
                child: ListTile(
                  title: Text(val['retailer']?['shopName'] ?? "Shop"),
                  subtitle: Text("Order Ref: ${val['_id'].substring(18)}"),
                  trailing: IconButton(
                    icon: const Icon(Icons.check_circle, color: Colors.green, size: 32),
                    onPressed: () => _markDelivered(val['_id']),
                  ),
                ),
              );
            },
        ),
    );
  }
}
