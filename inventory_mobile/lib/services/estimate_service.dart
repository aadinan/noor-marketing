import 'dart:convert';
import 'api_service.dart';

class EstimateService {
  final ApiService _api;
  EstimateService(this._api);

  Future<List<dynamic>> getEstimates() async {
    final response = await _api.getRequest('/estimates');
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      if (decoded is List) return decoded;
      if (decoded is Map && decoded['data'] is List) return decoded['data'];
    }
    return [];
  }

  Future<Map<String, dynamic>?> createEstimate(Map<String, dynamic> data) async {
    final response = await _api.postRequest('/estimates', data);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    return null;
  }

  Future<Map<String, dynamic>?> convertEstimate(String id) async {
    final response = await _api.postRequest('/estimates/$id/convert', {});
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    return null;
  }
}
