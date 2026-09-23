import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/db_helper.dart';

class CollectionScreen extends StatefulWidget {
  final String retailerId;
  final String shopName;

  const CollectionScreen({super.key, required this.retailerId, required this.shopName});

  @override
  State<CollectionScreen> createState() => _CollectionScreenState();
}

class _CollectionScreenState extends State<CollectionScreen> {
  final TextEditingController amtCtrl = TextEditingController();
  final TextEditingController refCtrl = TextEditingController();
  String _mode = 'Cash';

  /// Generates a WhatsApp receipt text and copies it to clipboard.
  /// NOTE: url_launcher removed due to Flutter SDK web-plugin constraint.
  /// Use this receipt text to manually send via WhatsApp or any messaging app.
  void _generateWhatsappReceipt(double amount) {
    final receiptId = 'NM-${DateTime.now().millisecondsSinceEpoch}';
    final text =
        'Thank you for your payment of ₹$amount to Noor Marketing. '
        'Receipt ID: $receiptId. '
        'Shop: ${widget.shopName}. '
        'Mode: $_mode. '
        'Date: ${DateTime.now().toString().substring(0, 16)}.';

    Clipboard.setData(ClipboardData(text: text));

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✅ Receipt copied to clipboard! Paste in WhatsApp.'),
        backgroundColor: Colors.green,
        duration: Duration(seconds: 4),
      ),
    );
  }

  void _saveCollection() async {
    final amt = double.tryParse(amtCtrl.text);
    if (amt == null || amt <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid amount'), backgroundColor: Colors.red),
      );
      return;
    }

    final record = {
      'retailerId': widget.retailerId,
      'amount': amt,
      'mode': _mode,
      'reference': refCtrl.text.trim(),
      'timestamp': DateTime.now().toIso8601String(),
    };

    // Save locally via SQLite Offline architecture
    await DatabaseHelper.instance.addOfflineCollection(record);

    if (!mounted) return;
    _generateWhatsappReceipt(amt);
    Navigator.of(context).pop();
  }

  @override
  void dispose() {
    amtCtrl.dispose();
    refCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Collect: ${widget.shopName}')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            DropdownButtonFormField<String>(
              value: _mode,
              items: ['Cash', 'Cheque', 'UPI']
                  .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                  .toList(),
              onChanged: (val) => setState(() => _mode = val!),
              decoration: const InputDecoration(labelText: 'Payment Mode'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: amtCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Amount (₹)',
                prefixIcon: Icon(Icons.currency_rupee),
              ),
            ),
            const SizedBox(height: 16),
            if (_mode != 'Cash')
              TextField(
                controller: refCtrl,
                decoration: const InputDecoration(labelText: 'Reference No. / UTR'),
              ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.receipt_long),
                label: const Text('Save & Copy WhatsApp Receipt'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
                onPressed: _saveCollection,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Receipt text will be copied to clipboard.\nOpen WhatsApp and paste to send.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
