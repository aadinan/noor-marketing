import 'package:flutter/material.dart';
import 'dart:convert';
import '../services/db_helper.dart';

class CartScreen extends StatefulWidget {
  final Map<String, dynamic> retailer; // Receives offline retailer data (id, creditLimit, outstanding)

  const CartScreen({super.key, required this.retailer});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<Map<String, dynamic>> _catalog = [];
  final List<Map<String, dynamic>> _cart = [];
  String _searchQuery = "";
  bool _isProcessing = false;
  final TextEditingController _bypassCodeCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadCatalog();
  }

  @override
  void dispose() {
    _bypassCodeCtrl.dispose();
    super.dispose();
  }

  void _loadCatalog() async {
    final db = await DatabaseHelper.instance.database;
    final products = await db.query('products');
    setState(() {
      _catalog = products;
    });
  }

  void _addToCart(Map<String, dynamic> product) {
    int index = _cart.indexWhere((item) => item['id'] == product['id']);
    if (index >= 0) {
      setState(() {
        _cart[index]['quantity']++;
      });
    } else {
      setState(() {
        _cart.add({
          'id': product['id'],
          'name': product['name'],
          'price': product['price'],
          'quantity': 1,
        });
      });
    }
  }

  double get _cartTotal {
    return _cart.fold(0, (sum, item) => sum + (item['price'] * item['quantity']));
  }

  bool get _isYellowAlert {
    double outstanding = (widget.retailer['outstandingBalance'] as num?)?.toDouble() ?? 0.0;
    double limit = (widget.retailer['creditLimit'] as num?)?.toDouble() ?? 10000.0;
    return (outstanding + _cartTotal) > limit;
  }

  Future<String?> _showBypassDialog() async {
    _bypassCodeCtrl.clear();
    String? pin;
    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("⚠️ YELLOW ALERT"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("Credit limit exceeded for ${widget.retailer['shopName'] ?? 'Shop'}.\nPlease enter Manager PIN to proceed."),
              const SizedBox(height: 12),
              TextField(
                controller: _bypassCodeCtrl,
                obscureText: true,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: "Manager PIN",
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, null),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: () {
                final enteredPin = _bypassCodeCtrl.text.trim();
                if (enteredPin.isNotEmpty) {
                  pin = enteredPin;
                  Navigator.pop(context);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Please enter Manager PIN")),
                  );
                }
              },
              child: const Text("Submit PIN"),
            )
          ],
        );
      },
    );
    return pin;
  }

  void _placeOfflineOrder() async {
    if (_cart.isEmpty) return;

    String? managerPin;
    if (_isYellowAlert) {
      // Credit Limit Enforcement: Block unless manager PIN is provided
      managerPin = await _showBypassDialog();
      if (managerPin == null || managerPin.isEmpty) return;
    }

    setState(() => _isProcessing = true);

    try {
      final itemsPayload = managerPin != null
          ? jsonEncode({'items': _cart, 'managerPin': managerPin})
          : jsonEncode(_cart);

      final orderData = {
        'retailerId': widget.retailer['id'] ?? widget.retailer['_id'],
        'itemsJson': itemsPayload,
        'totalValue': _cartTotal,
        'status': 'Pending',
        'timestamp': DateTime.now().toIso8601String(),
      };

      await DatabaseHelper.instance.addOfflineOrder(orderData);
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order Saved Offline Successfully!')));
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  void _showQuickAddDialog() {
    final TextEditingController nameCtrl = TextEditingController();
    final TextEditingController priceCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("⚡ Quick Add Item"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: "Item Name")),
              TextField(controller: priceCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: "Price")),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
            ElevatedButton(
              onPressed: () {
                if (nameCtrl.text.isNotEmpty && priceCtrl.text.isNotEmpty) {
                  _addToCart({
                    'id': 'quick-${DateTime.now().millisecondsSinceEpoch}',
                    'name': nameCtrl.text,
                    'price': double.tryParse(priceCtrl.text) ?? 0.0,
                  });
                  Navigator.pop(context);
                }
              },
              child: const Text("Add to Cart"),
            )
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    var filtered = _catalog.where((p) => p['name'].toString().toLowerCase().contains(_searchQuery.toLowerCase())).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text("Fast Cart - ${widget.retailer['shopName'] ?? 'Shop'}"),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on, color: Colors.amber),
            tooltip: 'Quick Add Item',
            onPressed: _showQuickAddDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // 1. Search Bar
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: "Search items...",
                border: OutlineInputBorder(),
              ),
              onChanged: (val) => setState(() => _searchQuery = val),
            ),
          ),
          // 2. Catalog Grid/List
          Expanded(
            flex: 3,
            child: ListView.builder(
              itemCount: filtered.length,
              itemBuilder: (context, i) {
                var p = filtered[i];
                return ListTile(
                  title: Text(p['name'] ?? ''),
                  subtitle: Text("Price: ₹${p['price']} | Stock: ${p['stockCount']}"),
                  trailing: IconButton(
                    icon: const Icon(Icons.add_shopping_cart, color: Colors.blue),
                    onPressed: () => _addToCart(p),
                  ),
                );
              },
            ),
          ),
          const Divider(thickness: 2),
          // 3. Current Cart
          Expanded(
            flex: 2,
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Text("Current Cart", style: TextStyle(fontWeight: FontWeight.bold)),
                ),
                Expanded(
                  child: ListView.builder(
                    itemCount: _cart.length,
                    itemBuilder: (context, i) {
                      var c = _cart[i];
                      return ListTile(
                        title: Text(c['name']),
                        trailing: Text("${c['quantity']} x ₹${c['price']} = ₹${(c['price'] * c['quantity']).toStringAsFixed(2)}"),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Total: ₹${_cartTotal.toStringAsFixed(2)}", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          if (_isYellowAlert)
                            const Text("Credit Limit Exceeded!", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      ElevatedButton(
                        onPressed: _isProcessing ? null : _placeOfflineOrder,
                        style: ElevatedButton.styleFrom(backgroundColor: _isYellowAlert ? Colors.orange : Colors.green),
                        child: _isProcessing ? const CircularProgressIndicator() : const Text("PLACE ORDER"),
                      )
                    ],
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
