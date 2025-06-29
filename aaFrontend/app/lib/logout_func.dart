import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'pages/login.dart';

class LogoutFunc extends StatelessWidget {
  const LogoutFunc({super.key});

  Future<void> _logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => const Login()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: () => _logout(context),
      icon: const Icon(Icons.logout),
      label: const Text('Logout'),
      style: TextButton.styleFrom(foregroundColor: Colors.red),
    );
  }
}
