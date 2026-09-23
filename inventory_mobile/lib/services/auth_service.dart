// lib/services/auth_service.dart
//
// Token storage: uses dart:io File via path_provider (app documents directory).
// flutter_secure_storage was removed because all versions >=6.x require
// flutter_web_plugins which is missing from this Flutter SDK installation.
// For production, upgrade the Flutter SDK to a full installation and restore
// flutter_secure_storage for Android Keystore / iOS Keychain backed storage.

import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

class AuthService extends ChangeNotifier {
  static const String baseUrl = 'http://10.0.2.2:5000/api'; // Android Emulator

  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _role;
  String? _name;
  String? _token;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get role => _role;
  String? get name => _name;
  String? get token => _token;

  AuthService() {
    checkAuth();
  }

  // --- Token file helpers ---

  Future<File> _tokenFile() async {
    final dir = await getApplicationDocumentsDirectory();
    return File('${dir.path}/.noor_token');
  }

  Future<void> _saveSession(String token, String role, String name) async {
    final file = await _tokenFile();
    final payload = jsonEncode({'token': token, 'role': role, 'name': name});
    await file.writeAsString(payload);
  }

  Future<Map<String, String>?> _loadSession() async {
    try {
      final file = await _tokenFile();
      if (!await file.exists()) return null;
      final raw = await file.readAsString();
      final Map<String, dynamic> data = jsonDecode(raw);
      return {
        'token': data['token'] as String,
        'role': data['role'] as String,
        'name': data['name'] as String,
      };
    } catch (_) {
      return null;
    }
  }

  Future<void> _deleteSession() async {
    try {
      final file = await _tokenFile();
      if (await file.exists()) await file.delete();
    } catch (_) {}
  }

  // --- Public methods ---

  Future<void> checkAuth() async {
    final session = await _loadSession();
    if (session != null) {
      _token = session['token'];
      _role = session['role'];
      _name = session['name'];
      _isAuthenticated = true;
    } else {
      _isAuthenticated = false;
    }
    notifyListeners();
  }

  Future<Map<String, dynamic>> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username, 'password': password}),
      );

      if (response.statusCode == 200) {
        // Backend returns flat: { _id, username, role, token }
        final data = jsonDecode(response.body) as Map<String, dynamic>;

        final token = data['token'] as String;
        final role = data['role'] as String;
        final name = data['username'] as String;

        await _saveSession(token, role, name);

        _token = token;
        _role = role;
        _name = name;
        _isAuthenticated = true;
        _isLoading = false;
        notifyListeners();

        return {'success': true, 'role': _role};
      } else {
        _isLoading = false;
        notifyListeners();
        return {'success': false, 'message': 'Invalid credentials'};
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  Future<void> logout() async {
    await _deleteSession();
    _isAuthenticated = false;
    _token = null;
    _role = null;
    _name = null;
    notifyListeners();
  }
}
