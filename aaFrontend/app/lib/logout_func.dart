import 'package:app/api_client.dart';
import 'package:app/main.dart';
import 'package:flutter/material.dart';
import 'pages/login.dart';

Future<void> logoutFunc() async {
  final dio=ApiClient().dio;
  try{
    await dio.post("/api/logout/");

    navigatorKey.currentState?.pushAndRemoveUntil(
    MaterialPageRoute(builder: (_) => const Login()),
    (route) => false,
  );
  }catch(e){
    print("Logout failed : $e");
  }

  
}
