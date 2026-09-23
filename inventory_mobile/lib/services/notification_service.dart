import 'dart:convert';
import 'api_service.dart';

class NotificationService {
  final ApiService _api;
  NotificationService(this._api);

  Future<List<dynamic>> getNotifications() async {
    final response = await _api.getRequest('/notifications');
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      if (decoded is List) return decoded;
      if (decoded is Map && decoded['data'] is List) return decoded['data'];
    }
    return [];
  }

  Future<int> getUnreadCount() async {
    final response = await _api.getRequest('/notifications/unread-count');
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      if (decoded is Map && decoded['count'] is num) {
        return (decoded['count'] as num).toInt();
      }
    }
    return 0;
  }

  Future<void> markRead(String id) async {
    await _api.patchRequest('/notifications/$id/read', {});
  }
}
