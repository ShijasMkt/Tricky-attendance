import 'dart:convert';
import 'package:app/pages/home.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final GlobalKey<FormState> _formKey=GlobalKey<FormState>();
  final TextEditingController _uNameController=TextEditingController();
  final TextEditingController _passwordController=TextEditingController();

  Future <void> _checkLogin() async{
    if(_formKey.currentState!.validate()){
      String uName=_uNameController.text.trim();
      String password=_passwordController.text;

      final formData={
        'uName':uName,
        'password':password,
      };

      final url = Uri.parse("http://192.168.100.5:8000/api/check_login/");
      try{
        final response=await http.post(
          url,
          headers: {
            'Content-Type': 'application/json',
          },
          body: jsonEncode(formData)
        );

        if(response.statusCode==200){
          final data=jsonDecode(response.body);
          final prefs=await SharedPreferences.getInstance();
          await prefs.setString('access_token', data['access']);
          await prefs.setString('refresh_token', data['refresh']);

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Login successful!")),
          );

          if(!mounted) return;

          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context)=>const Home()));
        }
        else{
          final error = jsonDecode(response.body);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Login failed: ${error['detail']}")),
          );
        }
      }catch(e){
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error connecting to backend")),
        );
      }
    }
  }
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: MediaQuery.of(context).size.height,
            ),
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 10,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Image.asset(
                          'assets/images/trickLogo.png',
                          height: 100,
                          width: 200,
                          fit: BoxFit.contain,
                        ),
                        SizedBox(height: 20),

                        TextFormField(
                          controller: _uNameController,
                          decoration: InputDecoration(
                            labelText: 'Username',
                            hintText: 'Enter Username',
                            prefixIcon: Icon(Icons.person),
                            border: OutlineInputBorder(),
                          ),
                          validator: (value){
                            if(value==null||value.isEmpty){
                              return 'Please enter your Username';
                            }
                            return null;
                          },
                        ),
                        SizedBox(height: 20),
                        TextFormField(
                          controller: _passwordController,
                          keyboardType: TextInputType.visiblePassword,
                          obscureText: true,
                          decoration: InputDecoration(
                            labelText: 'Password',
                            hintText: 'Enter Password',
                            prefixIcon: Icon(Icons.key),
                            border: OutlineInputBorder(),
                          ),
                          validator: (value){
                            if(value==null||value.isEmpty){
                              return "Please enter your Password";
                            }
                            return null;
                          },
                        ),
                        SizedBox(height: 20),
                        MaterialButton(
                          onPressed: _checkLogin,
                          minWidth: double.infinity,
                          child: Text('Login'),
                          color: Color(0xFF7D1329),
                          textColor: Colors.white,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
