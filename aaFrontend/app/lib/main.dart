import 'package:flutter/material.dart';
import 'auth_gate.dart';
void main(){
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Flutter Demo",
      theme: ThemeData(
        scaffoldBackgroundColor: Color(0xf5f5f5f5),
        fontFamily: 'Poppins'
      ),
      home: const AuthGate(),
    );
  }
}