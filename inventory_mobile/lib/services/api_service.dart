// lib/services/api_service.dart
//
// Token is read from the app documents directory file written by AuthService.
// flutter_secure_storage removed — see auth_service.dart for full explanation.

import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:5000/api'; // Android Emulator
  final http.Client _client = http.Client();

  Future<String?> _readToken() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/.noor_token');
      if (!await file.exists()) return null;
      final raw = await file.readAsString();
      final data = jsonDecode(raw) as Map<String, dynamic>;
      return data['token'] as String?;
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _readToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<http.Response> getRequest(String endpoint) async {
    final headers = await _getHeaders();
    return _client.get(Uri.parse('$baseUrl$endpoint'), headers: headers);
  }

  Future<http.Response> postRequest(String endpoint, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    return _client.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(data),
    );
  }

  Future<http.Response> putRequest(String endpoint, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    return _client.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(data),
    );
  }

  Future<http.Response> patchRequest(String endpoint, Map<String, dynamic> body) async {
    final headers = await _getHeaders();
    return _client.patch(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
  }
}
