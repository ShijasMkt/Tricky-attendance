
import 'package:app/api_client.dart';
import 'package:app/pages/home.dart';
import 'package:flutter/material.dart';

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
      final dio= ApiClient().dio;
      String uName=_uNameController.text.trim();
      String password=_passwordController.text;

      
      try{
        final response=await dio.post(
         "/api/check_login/",
         data: {
          'uName':uName,
          'password':password,
         }
        );

        if(response.statusCode==200){
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Login successful!")),
          );

          if(!mounted) return;

          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context)=>const Home()));
        }
        else{
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Login failed")),
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
                        Text("TrickyAttendence",textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF7D1329),fontSize: 20)),
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
                          color: Color(0xFF7D1329),
                          textColor: Colors.white,
                          child: Text('Login'),
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
