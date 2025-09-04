import 'package:app/api_client.dart';
import 'package:app/pages/home.dart';
import 'package:app/pages/login.dart';
import 'package:flutter/material.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  Future<bool> checkLoggedIn() async{
    final dio=ApiClient().dio;
    try{
      final response=await dio.get("/api/check_auth/");
      return response.statusCode==200;
    }catch(e){
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: checkLoggedIn(), 
      builder: (context,snapshot){
        if(snapshot.connectionState==ConnectionState.waiting){
          return const Scaffold(
            body: Center(child: CircularProgressIndicator(),),
          );
        }else{
          if(snapshot.data==true){
            return const Home();
          }else{
            return const Login();
          }
        }
      });
  }
}