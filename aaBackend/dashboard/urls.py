from django.urls import path
from .views import *

urlpatterns = [
    path('api/check_login/',checkLogin),
    path('api/create_staff/',createStaff),
    path('api/fetch_staff/',fetchStaff),
    path('api/delete_staff/',deleteStaff),


    
]