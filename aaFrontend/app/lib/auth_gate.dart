import 'package:app/pages/Home.dart';
import 'package:app/pages/login.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  Future<bool> checkLoggedIn() async{
    final prefs=await SharedPreferences.getInstance();
    final accessToken=prefs.getString('access_token');
    return accessToken!=null && accessToken.isNotEmpty;
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