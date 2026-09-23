import 'package:flutter/material.dart';
import '../services/db_helper.dart';
import '../models/retailer.dart';
import 'cart_screen.dart';
import 'collection_screen.dart';

class ShopManagementScreen extends StatefulWidget {
  final bool isSelecting;
  const ShopManagementScreen({super.key, this.isSelecting = false});

  @override
  State<ShopManagementScreen> createState() => _ShopManagementScreenState();
}

class _ShopManagementScreenState extends State<ShopManagementScreen> {
  List<Retailer> _retailers = [];
  String _searchQuery = "";
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRetailers();
  }

  Future<void> _loadRetailers() async {
    setState(() => _isLoading = true);
    final db = await DatabaseHelper.instance.database;
    final results = await db.query('retailers');
    
    setState(() {
      _retailers = results.map((r) => Retailer.fromSqliteMap(r)).toList();
      _isLoading = false;
    });
  }

  Color _getTrustColor(int score) {
    if (score >= 70) return Colors.green.shade700;
    if (score >= 40) return Colors.orange.shade700;
    return Colors.red.shade700;
  }

  Color _getTrustBgColor(int score) {
    if (score >= 70) return Colors.green.shade100;
    if (score >= 40) return Colors.orange.shade100;
    return Colors.red.shade100;
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _retailers.where((r) {
      final q = _searchQuery.toLowerCase();
      final shopMatch = (r.shopName ?? '').toLowerCase().contains(q);
      final ownerMatch = (r.ownerName ?? '').toLowerCase().contains(q);
      final cityMatch = (r.address?['city']?.toString().toLowerCase() ?? '').contains(q);
      return shopMatch || ownerMatch || cityMatch;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Text(widget.isSelecting ? 'Select Shop' : 'My Shops', style: const TextStyle(fontWeight: FontWeight.w900)),
        backgroundColor: Colors.blueGrey.shade900,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // Add shop functionality
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Quick Add Shop coming soon!')));
            },
          )
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: "Search by shop, owner, city...",
                filled: true,
                fillColor: Colors.blueGrey.shade800,
                hintStyle: const TextStyle(color: Colors.white54),
                prefixIcon: const Icon(Icons.search, color: Colors.white54),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              style: const TextStyle(color: Colors.white),
              onChanged: (val) => setState(() => _searchQuery = val),
            ),
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : filtered.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  itemBuilder: (context, i) {
                    final r = filtered[i];
                    return _buildRetailerCard(r);
                  },
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.store, size: 64, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          const Text('No shops found', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildRetailerCard(Retailer r) {
    bool hasDues = (r.outstandingBalance ?? 0) > 0;
    
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: widget.isSelecting ? () => Navigator.pop(context, r.toSqliteMap()) : null,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(Icons.store, color: Colors.grey.shade600),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(r.shopName ?? 'Unknown Shop', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                        Text('${r.ownerName ?? 'No Info'} · ${r.address?['city'] ?? 'Unknown'}', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                      ],
                    ),
                  ),
                  if (r.trustScore != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getTrustBgColor(r.trustScore!),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'Trust ${r.trustScore}',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                          color: _getTrustColor(r.trustScore!),
                        ),
                      ),
                    ),
                ],
              ),
              const Divider(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.phone, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text('No phone API mapping yet', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                    ],
                  ),
                  if (hasDues)
                    Row(
                      children: [
                        const Icon(Icons.warning_amber_rounded, size: 14, color: Colors.red),
                        const SizedBox(width: 4),
                        Text('Due: ₹${r.outstandingBalance?.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.red)),
                      ],
                    )
                  else
                    const Text('✓ Clear', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.green)),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue.shade50,
                        foregroundColor: Colors.blue.shade700,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () {
                        if (widget.isSelecting) {
                          Navigator.pop(context, r.toSqliteMap());
                        } else {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => CartScreen(retailer: r.toSqliteMap())));
                        }
                      },
                      child: const Text('New Order'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade50,
                        foregroundColor: Colors.green.shade700,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () {
                        if (widget.isSelecting) {
                          Navigator.pop(context, r.toSqliteMap());
                        } else {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => CollectionScreen(retailerId: r.id, shopName: r.shopName ?? 'Shop')));
                        }
                      },
                      child: const Text('Collect'),
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
