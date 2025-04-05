from django.urls import path
from .views import *

urlpatterns = [
    path('api/check_login/',checkLogin),
    path('api/create_staff/',createStaff),
    path('api/fetch_staff/',fetchStaff),
    path('api/delete_staff/',deleteStaff),
    path('api/edit_staff/',editStaff),
    path('api/fetch_Attendance/',fetchAttendance),
    path('api/mark_Attendance/',markAttendance),
    path('api/mark_Leave/',markLeave),
    path('api/update_Attendance/',updateAttendance),
    path('api/upload_staff_img/',uploadStaffImg),
    

    
]