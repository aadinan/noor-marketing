import 'dart:convert';

class Retailer {
  final String id;
  final String? shopName;
  final String? ownerName;
  final double? outstandingBalance;
  final double? creditLimit;
  final String? gstNumber;
  final Map<String, dynamic>? address;
  final int? trustScore;

  Retailer({
    required this.id,
    this.shopName,
    this.ownerName,
    this.outstandingBalance,
    this.creditLimit,
    this.gstNumber,
    this.address,
    this.trustScore,
  });

  factory Retailer.fromJson(Map<String, dynamic> json) {
    return Retailer(
      id: json['_id'],
      shopName: json['shopName'],
      ownerName: json['ownerName'],
      outstandingBalance: (json['outstandingBalance'] as num?)?.toDouble(),
      creditLimit: (json['creditLimit'] as num?)?.toDouble(),
      gstNumber: json['gstNumber'],
      address: json['address'] != null ? Map<String, dynamic>.from(json['address']) : null,
      trustScore: (json['metrics'] != null && json['metrics']['trustScore'] != null)
          ? json['metrics']['trustScore'] as int
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'shopName': shopName,
      'ownerName': ownerName,
      'outstandingBalance': outstandingBalance,
      'creditLimit': creditLimit,
      'gstNumber': gstNumber,
      'address': address,
      'metrics': trustScore != null ? {'trustScore': trustScore} : null,
    };
  }

  // Converts native object to SQLite Map representation where complex objects are stringified.
  Map<String, dynamic> toSqliteMap() {
    return {
      'id': id,
      'shopName': shopName,
      'ownerName': ownerName,
      'outstandingBalance': outstandingBalance,
      'creditLimit': creditLimit,
      'gstNumber': gstNumber,
      'address': address != null ? jsonEncode(address) : null,
      'trustScore': trustScore,
    };
  }

  // Builds object from SQLite result payload.
  factory Retailer.fromSqliteMap(Map<String, dynamic> map) {
    return Retailer(
      id: map['id'],
      shopName: map['shopName'],
      ownerName: map['ownerName'],
      outstandingBalance: (map['outstandingBalance'] as num?)?.toDouble(),
      creditLimit: (map['creditLimit'] as num?)?.toDouble(),
      gstNumber: map['gstNumber'],
      address: map['address'] != null ? jsonDecode(map['address']) as Map<String, dynamic> : null,
      trustScore: map['trustScore'] as int?,
    );
  }
}
