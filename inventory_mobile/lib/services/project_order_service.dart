import 'dart:convert';
import 'api_service.dart';

class ProjectOrderService {
  final ApiService _api;
  ProjectOrderService(this._api);

  Future<List<dynamic>> getProjectOrders() async {
    final response = await _api.getRequest('/project-orders');
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      if (decoded is List) return decoded;
      if (decoded is Map && decoded['data'] is List) return decoded['data'];
    }
    return [];
  }

  Future<Map<String, dynamic>?> createProjectQuotation(Map<String, dynamic> data) async {
    final response = await _api.postRequest('/project-orders', data);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    return null;
  }

  Future<Map<String, dynamic>?> convertProjectOrder(String id) async {
    final response = await _api.postRequest('/project-orders/$id/convert', {});
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    return null;
  }
}
