import 'dart:convert';
import 'package:app/logout_func.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

Future <String?> getValidToken() async{
  final prefs=await SharedPreferences.getInstance();
  final refresh=prefs.getString('refresh_token');

  if(refresh==null){
    logoutFunc();
    return null;
  }

  final res=await http.post(
    Uri.parse('http://192.168.100.5:8000/api/token/refresh/'),
    headers: {'content-Type':'application/json'},
    body: jsonEncode({'refresh': refresh}),
  );

  if(res.statusCode==200){
    final data=jsonDecode(res.body);
    final newAccess=data['access'] as String;

    await prefs.setString('access_token', newAccess);

    return newAccess;
  }else{
    logoutFunc();
    return null;
  }

}