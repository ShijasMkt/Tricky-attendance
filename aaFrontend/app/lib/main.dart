import 'package:app/api_client.dart';
import 'package:flutter/material.dart';
import 'auth_gate.dart';

final GlobalKey<NavigatorState> navigatorKey=GlobalKey<NavigatorState>();
void main()async{
  WidgetsFlutterBinding.ensureInitialized();
  await ApiClient().init();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey,
      title: "Flutter Demo",
      theme: ThemeData(
        scaffoldBackgroundColor: Color(0xf5f5f5f5),
        fontFamily: 'Poppins'
      ),
      home: const AuthGate(),
    );
  }
}