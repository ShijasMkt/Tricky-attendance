import 'package:app/main.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'pages/login.dart';

Future<void> logoutFunc() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.clear();

  navigatorKey.currentState?.pushAndRemoveUntil(
    MaterialPageRoute(builder: (_) => const Login()),
    (route) => false,
  );
}
