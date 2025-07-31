
import 'package:app/logout_func.dart';
import 'package:dio/dio.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

class ApiClient{
  late Dio dio;
  static final ApiClient _singleton = ApiClient._internal();
  late PersistCookieJar _cookieJar;

  factory ApiClient(){
    return _singleton;
  }

  ApiClient._internal(){
    dio=Dio();
  }

  Future<void> init() async{
    Directory appDocDir = await getApplicationDocumentsDirectory();
    _cookieJar = PersistCookieJar(
      storage: FileStorage("${appDocDir.path}/.cookies/"),
    ); 

    dio.options.baseUrl = "http://192.168.100.5:8000";
    dio.options.headers['content-Type'] = 'application/json';
    dio.interceptors.add(CookieManager(_cookieJar));
    dio.interceptors.add(_tokenRefreshInterceptor());
  }

  Interceptor _tokenRefreshInterceptor(){
    return InterceptorsWrapper(
      onError: (DioException e, ErrorInterceptorHandler handler) async{
        final reqOptions=e.requestOptions;

        if(e.response?.statusCode == 401 && 
        !reqOptions.path.contains("/api/token/refresh/") &&
        !reqOptions.path.contains("/api/logout/")){
          try{
            final refreshResponse = await dio.post('/api/token/refresh/');
            if(refreshResponse.statusCode == 200){
              final retryResponse = await dio.request(
                reqOptions.path,
                options: Options(
                  method: reqOptions.method,
                  headers: reqOptions.headers,
                ),
                data: reqOptions.data,
                queryParameters: reqOptions.queryParameters,
              );

              return handler.resolve(retryResponse);
            }
          } catch(refreshErr){
            print("token refresh failed...");
            await logoutFunc();
          }
        }
        return handler.next(e);
      }
    );
  }
}