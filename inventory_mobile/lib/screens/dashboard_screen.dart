import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/auth_service.dart';
import 'salesman_home.dart';
import 'warehouse_home.dart';
import 'boss_dashboard.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final role = auth.role;

    if (role == 'Salesman') return const SalesmanHome();
    if (role == 'Warehouse') return const WarehouseHome();
    return const BossDashboard(); // Default or Boss role
  }
}
