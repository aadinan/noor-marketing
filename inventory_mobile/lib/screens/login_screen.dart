import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController emailCtrl = TextEditingController();
  final TextEditingController passCtrl = TextEditingController();
  bool _isPasswordVisible = false;

  void handleLogin() async {
    final auth = Provider.of<AuthService>(context, listen: false);
    
    var result = await auth.login(emailCtrl.text.trim(), passCtrl.text.trim());
    
    if (!mounted) return;

    if (!result['success']) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message'] ?? "Error"))
      );
    }
    // No need to Navigator.push, main.dart will automatically rebuild and show DashboardScreen when auth.isAuthenticated == true
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<AuthService>().isLoading;

    return Scaffold(
      backgroundColor: Colors.blueGrey[900], // Dark Theme like React
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("SYSTEM LOGIN", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 40),
            TextField(
              controller: emailCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: "Username",
                labelStyle: TextStyle(color: Colors.grey),
                enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.grey)),
              ),
              keyboardType: TextInputType.text,
            ),
            const SizedBox(height: 20),
            TextField(
              controller: passCtrl,
              obscureText: !_isPasswordVisible,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: "Password",
                labelStyle: const TextStyle(color: Colors.grey),
                enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Colors.grey)),
                suffixIcon: IconButton(
                  icon: Icon(
                    _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
                    color: Colors.grey,
                  ),
                  onPressed: () {
                    setState(() {
                      _isPasswordVisible = !_isPasswordVisible;
                    });
                  },
                ),
              ),
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: loading ? null : handleLogin,
                child: loading ? const CircularProgressIndicator() : const Text("ACCESS DASHBOARD"),
              ),
            )
          ],
        ),
      ),
    );
  }
}
