from django.urls import path
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/check_login/',checkLogin),
    path('api/logout/',logout_func),
    path('api/check_auth/', check_auth),
    path('api/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/create_staff/',createStaff),
    path('api/fetch_staff/',fetchStaff),
    path('api/delete_staff/',deleteStaff),
    path('api/edit_staff/',editStaff),
    path('api/fetch_Attendance/',fetchAttendance),
    path('api/mark_Attendance/',markAttendance),
    path('api/mark_Leave/',markLeave),
    path('api/update_Attendance/',updateAttendance),
    path('api/upload_staff_img/',uploadStaffImg),
    path('api/delete_staff_img/',deleteStaffImg),
    path('api/face_rec_mark_Attendance/',faceRecognitionAttendance),
    path('api/fetch_total_employees/',fetchTotalEmployees),
    
]