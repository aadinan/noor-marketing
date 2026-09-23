// barcode_scanner_screen.dart
//
// NOTE: The mobile_scanner package (required for camera-based barcode scanning)
// is currently incompatible with this Flutter SDK installation because the SDK
// is missing the flutter_web_plugins component required by mobile_scanner >= 1.0.0.
//
// This screen provides a manual SKU entry fallback that achieves the same
// workflow result (fetching product info by SKU/barcode string) without
// requiring camera access.
//
// To re-enable camera scanning in a full Flutter SDK environment, restore:
//   - pubspec.yaml: mobile_scanner: ^5.2.3
//   - The MobileScanner widget and BarcodeCapture callback

import 'package:flutter/material.dart';
import '../services/inventory_service.dart';

class BarcodeScannerScreen extends StatefulWidget {
  const BarcodeScannerScreen({super.key});

  @override
  State<BarcodeScannerScreen> createState() => _BarcodeScannerScreenState();
}

class _BarcodeScannerScreenState extends State<BarcodeScannerScreen> {
  final InventoryService inventoryService = InventoryService();
  final TextEditingController _skuController = TextEditingController();
  bool _isLoading = false;
  Map<String, dynamic>? _result;

  Future<void> _lookup() async {
    final sku = _skuController.text.trim();
    if (sku.isEmpty) return;

    setState(() {
      _isLoading = true;
      _result = null;
    });

    try {
      final product = await inventoryService.fetchProductByBarcode(sku);
      setState(() {
        _result = product;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _result = {'error': 'Network error: $e'};
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _skuController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Product Lookup'),
        backgroundColor: Colors.blueGrey[900],
        foregroundColor: Colors.white,
      ),
      backgroundColor: Colors.blueGrey[900],
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Camera scanning notice
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.withValues(alpha: 0.15),
                border: Border.all(color: Colors.orange.withValues(alpha: 0.5)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.orange, size: 16),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Camera scanning requires full Flutter SDK. Use manual SKU entry below.',
                      style: TextStyle(color: Colors.orange, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Manual SKU input
            const Text(
              'Enter SKU / Barcode',
              style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _skuController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'e.g. WP-LED-9W',
                      hintStyle: const TextStyle(color: Colors.grey),
                      enabledBorder: const OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.grey),
                      ),
                      focusedBorder: const OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.blue),
                      ),
                      prefixIcon: const Icon(Icons.qr_code, color: Colors.grey),
                    ),
                    onSubmitted: (_) => _lookup(),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isLoading ? null : _lookup,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                  ),
                  child: _isLoading
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.search),
                ),
              ],
            ),

            const SizedBox(height: 32),

            // Result card
            if (_result != null)
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _result!['error'] != null
                      ? Colors.red.withValues(alpha: 0.1)
                      : Colors.green.withValues(alpha: 0.1),
                  border: Border.all(
                    color: _result!['error'] != null ? Colors.red : Colors.green,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: _result!['error'] != null
                    ? Row(
                        children: [
                          const Icon(Icons.error_outline, color: Colors.red),
                          const SizedBox(width: 8),
                          Text(
                            _result!['error'],
                            style: const TextStyle(color: Colors.red),
                          ),
                        ],
                      )
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.check_circle, color: Colors.green),
                              const SizedBox(width: 8),
                              Text(
                                _result!['name'] ?? 'Product Found',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('Brand: ${_result!['brand'] ?? "—"}', style: const TextStyle(color: Colors.white70)),
                          Text('SKU: ${_result!['sku'] ?? "—"}', style: const TextStyle(color: Colors.white70)),
                          Text('Base Price: ₹${_result!['basePrice'] ?? "—"}', style: const TextStyle(color: Colors.white70)),
                          Text(
                            'Stock: ${_result!['inventory']?['stockCount'] ?? "—"}',
                            style: TextStyle(
                              color: (_result!['inventory']?['stockCount'] ?? 0) < 20
                                  ? Colors.orange
                                  : Colors.white70,
                            ),
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
