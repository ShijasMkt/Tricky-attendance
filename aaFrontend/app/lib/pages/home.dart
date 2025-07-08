import 'dart:convert';
import 'package:app/logout_func.dart';
import 'package:app/validate_token.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import 'package:camera/camera.dart';
import 'package:http/http.dart' as http;

class Home extends StatefulWidget {
  const Home({super.key});

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  String formattedDate = "";
  String currentTime = "";
  late Timer timer;
  List<CameraDescription> cameras = [];
  CameraController? cameraController;

  @override
  void initState() {
    super.initState();
    DateTime now = DateTime.now();
    final formatter = DateFormat('dd MMMM yyyy');
    formattedDate = formatter.format(now);

    _initializeCamera();
    _updateTime();
    timer = Timer.periodic(Duration(seconds: 1), (Timer t) => _updateTime());
  }

  void _updateTime() {
    final now = DateTime.now();
    final timeFormat = DateFormat('hh:mm:ss a');

    setState(() {
      currentTime = timeFormat.format(now);
    });
  }

  Future<void> _initializeCamera() async {
    cameras = await availableCameras();
  }

 void _showCameraPopUp() async {
  if (cameras.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("No Cameras Available!")),
    );
    return;
  }

  cameraController = CameraController(cameras[1], ResolutionPreset.high);
  try {
    await cameraController!.initialize();
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Failed to initialize camera: $e")),
    );
    return;
  }

  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) => Dialog(
      insetPadding: EdgeInsets.all(10),
      backgroundColor: Colors.black,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final aspectRatio = 0.7;
          final width = constraints.maxWidth;
          final height = width / aspectRatio;

          return Stack(
            children: [
              Center(
                child: SizedBox(
                  width: width,
                  height: height,
                  child: CameraPreview(cameraController!),
                ),
              ),
              Positioned(
                top: 10,
                right: 10,
                child: IconButton(
                  onPressed: () {
                    cameraController?.dispose();
                    Navigator.of(context).pop();
                  },
                  icon: Icon(Icons.close, color: Colors.white, size: 30),
                ),
              ),
            ],
          );
        },
      ),
    ),
  );
  scanFaceAndMarkAttendance();
}

void scanFaceAndMarkAttendance() async{
  print("++++++++");
  final token=await getValidToken();
  final res=await http.get(
    Uri.parse('http://192.168.100.5:8000/api/face_rec_mark_Attendance/'),
    headers: {'Authorization':'Bearer $token'}
  );
  final data=jsonDecode(res.body);

  print(data);
}


  @override
  void dispose() {
    timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("TrickyDot", style: TextStyle(color: Colors.white)),
        backgroundColor: Color(0xFF7D1329),
        actions: [
          PopupMenuButton(
            onSelected: (value) => {
              if (value == 'logout') {logoutFunc()},
            },
            icon: Icon(Icons.settings, color: Colors.white),
            itemBuilder: (BuildContext context) => [
              PopupMenuItem(value: 'profile', child: Text('Profile')),
              PopupMenuItem(value: 'logout', child: Text('Logout')),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: ConstrainedBox(
          constraints: BoxConstraints(
            minHeight: MediaQuery.of(context).size.height,
          ),
          child: Container(
            padding: EdgeInsets.all(20),
            alignment: Alignment.topCenter,
            child: Column(
              children: [
                SizedBox(height: 20),
                Text(
                  formattedDate,
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 20),
                Container(
                  padding: EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(50),
                    color: Color(0xf5f5f5f5),
                  ),
                  child: Text(
                    currentTime,
                    style: TextStyle(fontSize: 24, color: Colors.green),
                  ),
                ),
                SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => _showCameraPopUp(),
                  child: Text("Scan Face"),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
