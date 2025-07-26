import 'dart:convert';

import "package:app/validate_token.dart";
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:http/http.dart' as http;

class FaceScanScreen extends StatefulWidget {
  final VoidCallback onClose;

  const FaceScanScreen({super.key, required this.onClose});

  @override
  State<FaceScanScreen> createState() => _FaceScanScreenState();
}

class _FaceScanScreenState extends State<FaceScanScreen> {
  CameraController? _cameraController;
  FaceDetector? _faceDetector;
  bool _isDetecting = false;
  bool _isLoading = false;
  List<Face> _faces = [];

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final cameras = await availableCameras();
    final camera = cameras.firstWhere(
      (c) => c.lensDirection == CameraLensDirection.front,
    );
    _cameraController = CameraController(camera, ResolutionPreset.medium);
    await _cameraController!.initialize();
    _faceDetector = FaceDetector(
      options: FaceDetectorOptions(performanceMode: FaceDetectorMode.fast),
    );

    _cameraController!.startImageStream((CameraImage image) {
      if (_isDetecting) return;
      _isDetecting = true;
      _processImage(image);
    });

    setState(() {});
  }

  Future<void> _processImage(CameraImage image) async {
    final inputImage = await _convertCameraImage(
      image,
      _cameraController!.description,
    );

    final faces = await _faceDetector!.processImage(inputImage);
    setState(() => _faces = faces);
    _isDetecting = false;
  }

  Future<InputImage> _convertCameraImage(
    CameraImage image,
    CameraDescription camera,
  ) async {
    final WriteBuffer allBytes = WriteBuffer();
    for (final plane in image.planes) {
      allBytes.putUint8List(plane.bytes);
    }
    final bytes = allBytes.done().buffer.asUint8List();

    final rotation = _rotationIntToImageRotation(camera.sensorOrientation);

    return InputImage.fromBytes(
      bytes: bytes,
      metadata: InputImageMetadata(
        size: Size(image.width.toDouble(), image.height.toDouble()),
        rotation: rotation,
        format: InputImageFormat.yuv420,
        bytesPerRow: image.planes.first.bytesPerRow,
      ),
    );
  }

  InputImageRotation _rotationIntToImageRotation(int rotation) {
    switch (rotation) {
      case 0:
        return InputImageRotation.rotation0deg;
      case 90:
        return InputImageRotation.rotation90deg;
      case 180:
        return InputImageRotation.rotation180deg;
      case 270:
        return InputImageRotation.rotation270deg;
      default:
        return InputImageRotation.rotation0deg;
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    _faceDetector?.close();
    super.dispose();
  }

  Future<void> _captureAndSend() async {
    setState(() {
      _isLoading = true;
    });
    final file = await _cameraController!.takePicture();
    final bytes = await file.readAsBytes();
    final token = await getValidToken();

    final request = http.MultipartRequest(
      'POST',
      Uri.parse('http://192.168.100.5:8000/api/face_rec_mark_Attendance/'),
    );
    request.files.add(
      http.MultipartFile.fromBytes('image', bytes, filename: 'frame.jpg'),
    );
    request.headers.addAll({'Authorization': 'Bearer $token'});

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);

      if (data['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${data['message']}: ${data['name']}')),
        );
      }
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Server error. Try again.')));
    }
    setState(() {
      _isLoading = false;
    });
    widget.onClose();
  }

  @override
  Widget build(BuildContext context) {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return const Center(child: CircularProgressIndicator());
    }

    return Stack(
      children: [
        CameraPreview(_cameraController!),
        CustomPaint(painter: FacePainter(_faces), child: Container()),
        if (_isLoading)
          Container(
            color: Colors.black54,
            child: const Center(child: CircularProgressIndicator()),
          ),
        Positioned(
          bottom: 20,
          left: 20,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _captureAndSend,
            child: _isLoading
                ? Text('Loading...')
                : Text('Capture & Recognize'),
          ),
        ),
        Positioned(
          top: 20,
          right: 20,
          child: IconButton(
            icon: const Icon(Icons.close),
            onPressed: widget.onClose,
          ),
        ),
      ],
    );
  }
}

class FacePainter extends CustomPainter {
  final List<Face> faces;

  FacePainter(this.faces);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.red
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    for (var face in faces) {
      canvas.drawRect(face.boundingBox, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
