import 'package:flutter/material.dart';
import '../services/db_helper.dart';

class EODTallyScreen extends StatefulWidget {
  const EODTallyScreen({super.key});

  @override
  State<EODTallyScreen> createState() => _EODTallyScreenState();
}

class _EODTallyScreenState extends State<EODTallyScreen> {
  List<Map<String, dynamic>> _collections = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCollections();
  }

  void _loadCollections() async {
    final list = await DatabaseHelper.instance.getOfflineCollections();
    setState(() {
      _collections = list;
      _isLoading = false;
    });
  }

  double get _cashTotal => _collections.where((c) => c['mode'] == 'Cash').fold(0, (s, c) => s + (c['amount'] as double));
  double get _upiTotal => _collections.where((c) => c['mode'] == 'UPI').fold(0, (s, c) => s + (c['amount'] as double));
  double get _chequeTotal => _collections.where((c) => c['mode'] == 'Cheque').fold(0, (s, c) => s + (c['amount'] as double));
  double get _grandTotal => _cashTotal + _upiTotal + _chequeTotal;

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      appBar: AppBar(title: const Text("End Of Day Tally")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Text("Verify your physical collections before logging off:", style: TextStyle(fontSize: 16)),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(child: _buildStatCard("Total Cash", _cashTotal, Colors.green)),
                const SizedBox(width: 16),
                Expanded(child: _buildStatCard("Total UPI", _upiTotal, Colors.blue)),
              ],
            ),
            const SizedBox(height: 16),
            _buildStatCard("Total Cheque", _chequeTotal, Colors.purple),
            const Divider(height: 48, thickness: 2),
            Text("GRAND TOTAL: ₹${_grandTotal.toStringAsFixed(2)}", style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: () {
                // Usually an API call to mark EOD verified
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("EOD Verified!")));
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50)),
              child: const Text("CONFIRM TALLY"),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, double amount, Color c) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.1),
        border: Border.all(color: c),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(title, style: TextStyle(color: c, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text("₹${amount.toStringAsFixed(2)}", style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
