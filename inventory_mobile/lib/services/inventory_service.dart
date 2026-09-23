import 'dart:convert';
import 'api_service.dart';

class InventoryService {
  final ApiService _apiService = ApiService();

  Future<List<dynamic>> fetchInventory() async {
    try {
      final response = await _apiService.getRequest('/products');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load inventory: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> fetchProductByBarcode(String barcode) async {
    try {
      final response = await _apiService.getRequest('/products/barcode/$barcode');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 404) {
        return {'error': 'Product not found'};
      } else {
        throw Exception('Failed to load product');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}
