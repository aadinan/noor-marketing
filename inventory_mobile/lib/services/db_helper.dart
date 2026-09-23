import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import '../models/retailer.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('inventory_offline.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    Directory documentsDirectory = await getApplicationDocumentsDirectory();
    String path = join(documentsDirectory.path, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    // 1. PRODUCTS TABLE
    await db.execute('''
      CREATE TABLE products (
        id TEXT PRIMARY KEY,
        name TEXT,
        brand TEXT,
        sku TEXT,
        price REAL,
        stockCount INTEGER
      )
    ''');

    // 2. RETAILERS TABLE (Credit Limit Enforcement)
    await db.execute('''
      CREATE TABLE retailers (
        id TEXT PRIMARY KEY,
        shopName TEXT,
        ownerName TEXT,
        outstandingBalance REAL,
        creditLimit REAL,
        gstNumber TEXT,
        address TEXT,
        trustScore INTEGER
      )
    ''');

    // 3. OFFLINE QUEUE: ORDERS
    await db.execute('''
      CREATE TABLE offline_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        retailerId TEXT,
        itemsJson TEXT,
        totalValue REAL,
        status TEXT,
        timestamp TEXT
      )
    ''');

    // 4. OFFLINE QUEUE: COLLECTIONS
    await db.execute('''
      CREATE TABLE offline_collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        retailerId TEXT,
        amount REAL,
        mode TEXT,
        reference TEXT,
        timestamp TEXT
      )
    ''');
  }

  // --- Helpers ---
  
  Future<void> addOfflineOrder(Map<String, dynamic> order) async {
    final db = await instance.database;
    await db.insert('offline_orders', order);
  }

  Future<List<Map<String, dynamic>>> getOfflineOrders() async {
    final db = await instance.database;
    return await db.query('offline_orders');
  }

  Future<void> addOfflineCollection(Map<String, dynamic> collection) async {
    final db = await instance.database;
    await db.insert('offline_collections', collection);
  }

  Future<List<Map<String, dynamic>>> getOfflineCollections() async {
    final db = await instance.database;
    return await db.query('offline_collections');
  }

  // Clear specific queues upon successful sync
  Future<void> clearOfflineQueue(String table, int id) async {
    final db = await instance.database;
    await db.delete(table, where: 'id = ?', whereArgs: [id]);
  }

  // Utility to sync catalog from backend
  Future<void> syncProducts(List<dynamic> productsData) async {
    final db = await instance.database;
    Batch batch = db.batch();
    await db.delete('products'); // Clear old
    for (var p in productsData) {
      batch.insert('products', {
        'id': p['_id'],
        'name': p['name'],
        'brand': p['brand'],
        'sku': p['sku'],
        'price': (p['basePrice'] != null) ? (p['basePrice'] as num).toDouble() : 0.0,
        'stockCount': (p['inventory'] != null && p['inventory']['stockCount'] != null) ? p['inventory']['stockCount'] : 0,
      });
    }
    await batch.commit();
  }

  // Utility to sync retailers for credit enforcement
  Future<void> syncRetailers(List<dynamic> retailersData) async {
    final db = await instance.database;
    Batch batch = db.batch();
    await db.delete('retailers'); 
    for (var r in retailersData) {
      final retailer = Retailer.fromJson(r as Map<String, dynamic>);
      batch.insert('retailers', retailer.toSqliteMap());
    }
    await batch.commit();
  }
}

