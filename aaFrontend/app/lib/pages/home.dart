import 'package:app/api_client.dart';
import 'package:app/logout_func.dart';
import 'package:app/pages/scan_face.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:async';


class Home extends StatefulWidget {
  const Home({super.key});

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  String formattedDate = "";
  String currentTime = "";
  late Timer timer;
  List<Map<String, dynamic>> present = [];
  List<Map<String, dynamic>> absent = [];
  List<Map<String, dynamic>> leave = [];

  @override
  void initState() {
    super.initState();
    DateTime now = DateTime.now();
    final formatter = DateFormat('dd MMMM yyyy');
    formattedDate = formatter.format(now);

    _updateTime();
    timer = Timer.periodic(Duration(seconds: 1), (Timer t) => _updateTime());

    _fetchAttendence();
  }

  Future<void> _fetchAttendence() async {
    
    final dio=ApiClient().dio;
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());

    final res = await dio.post(
      "/api/fetch_Attendance/",
      data: {'date': today}
    );

    if (res.statusCode == 200) {
      final List data = res.data;

      setState(() {
        present = data
            .where((e) => e['status'] == 'P')
            .toList()
            .cast<Map<String, dynamic>>();

        present.sort((a,b){
          DateTime timeA=DateTime.parse(a['time']);
          DateTime timeB=DateTime.parse(b['time']);
          return timeB.compareTo(timeA);
        });
        absent = data
            .where((e) => e['status'] == 'A')
            .toList()
            .cast<Map<String, dynamic>>();
        leave = data
            .where((e) => e['status'] == 'L')
            .toList()
            .cast<Map<String, dynamic>>();
      });
    }
  }

  void _updateTime() {
    final now = DateTime.now();
    final timeFormat = DateFormat('hh:mm:ss a');

    setState(() {
      currentTime = timeFormat.format(now);
    });
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
        title: Text("TrickyAttendence", style: TextStyle(color: Colors.white)),
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
      body: RefreshIndicator(
        onRefresh: _fetchAttendence,
        child: SingleChildScrollView(
          physics: AlwaysScrollableScrollPhysics(),
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
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (context) => Dialog(
                          insetPadding: EdgeInsets.all(15),
                          child: SizedBox(
                            width: double.infinity,
                            height: MediaQuery.of(context).size.height * 0.8,
                            child: FaceScanScreen(
                              onClose: () {
                                _fetchAttendence();
                                Navigator.of(context).pop();
                              },
                            ),
                          ),
                        ),
                      );
                    },
                    child: Text("Scan Face"),
                  ),
                  SizedBox(height: 40),
                  Text(
                    "Today's Log:",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 10),
                  ...present.map(
                    (staff) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black12, 
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: ListTile(
                          tileColor: Colors.transparent,
                          leading: CircleAvatar(
                            backgroundImage: NetworkImage(
                              "http://192.168.100.5:8000${staff['staff_data']['images'][0]['image']}",
                            ),
                          ),
                          title: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("#${staff['staff_data']['staff_id']}"),
                              Text("${staff['staff_name']}"),
                            ],
                          ),
        
                          trailing: Text(
                            DateFormat(
                              'hh:mm a',
                            ).format(DateTime.parse(staff['time']).toLocal()),
                            style: TextStyle(color: Colors.green, fontSize: 14),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
