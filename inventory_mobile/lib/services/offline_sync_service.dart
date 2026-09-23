import 'dart:convert';
import 'package:flutter/material.dart';
import 'db_helper.dart';
import 'api_service.dart';

class OfflineSyncService {
  final ApiService _apiService = ApiService();

  Future<void> syncAllData() async {
    // 1. Sync Collections
    final collections = await DatabaseHelper.instance.getOfflineCollections();
    for (var col in collections) {
      try {
        final res = await _apiService.postRequest('/collections', {
          'retailerId': col['retailerId'],
          'amount': col['amount'],
          'mode': col['mode'],
          'reference': col['reference'],
        });
        if (res.statusCode == 200 || res.statusCode == 201) {
          // Conflict resolution: successful POST removes it from local queue
          await DatabaseHelper.instance.clearOfflineQueue('offline_collections', col['id']);
        }
      } catch (e) {
        debugPrint("Failed to sync collection ${col['id']}: $e");
      }
    }

    // 2. Sync Orders
    final orders = await DatabaseHelper.instance.getOfflineOrders();
    for (var ord in orders) {
      try {
        dynamic items = ord['itemsJson'];
        String? managerPin;
        try {
          final decoded = jsonDecode(ord['itemsJson']);
          if (decoded is Map) {
            items = jsonEncode(decoded['items']);
            managerPin = decoded['managerPin']?.toString();
          }
        } catch (_) {}

        final payload = <String, dynamic>{
          'retailerId': ord['retailerId'],
          'items': items,
          'totalValue': ord['totalValue'],
        };
        if (managerPin != null && managerPin.isNotEmpty) {
          payload['managerPin'] = managerPin;
          payload['bypassCode'] = managerPin;
        }

        final res = await _apiService.postRequest('/orders', payload);
        if (res.statusCode == 200 || res.statusCode == 201) {
          // Remove locally after sync
          await DatabaseHelper.instance.clearOfflineQueue('offline_orders', ord['id']);
        }
      } catch (e) {
        debugPrint("Failed to sync order ${ord['id']}: $e");
      }
    }
    
    // 3. Pull latest Catalog & Retailers down to SQLite
    try {
      final productsRes = await _apiService.getRequest('/products');
      if (productsRes.statusCode == 200) {
        final decoded = jsonDecode(productsRes.body);
        final list = (decoded is Map && decoded['data'] != null) ? decoded['data'] : (decoded is List ? decoded : []);
        if (list is List) {
          await DatabaseHelper.instance.syncProducts(list);
        }
      }

      final retailersRes = await _apiService.getRequest('/retailers');
      if (retailersRes.statusCode == 200) {
        final decoded = jsonDecode(retailersRes.body);
        final list = (decoded is Map && decoded['data'] != null) ? decoded['data'] : (decoded is List ? decoded : []);
        if (list is List) {
          await DatabaseHelper.instance.syncRetailers(list);
        }
      }
    } catch (e) {
       debugPrint("Failed to pull latest DB mappings down: $e");
    }
  }
}
