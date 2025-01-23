from django.shortcuts import render
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from .tools.serializer import *




def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def checkLogin(request):
    if request.method== 'POST':
        data = request.data
        user_name = data.get('uName')
        password = data.get('password')
        
        try:
            user = Users.objects.get(name=user_name, password=password)
        except Users.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

        tokens = get_tokens_for_user(user)
        return Response({'access': tokens['access'], 'refresh': tokens['refresh']}, status=status.HTTP_200_OK)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def createStaff(request):
    
    if request.method=='POST':
        formData=request.data.get('formData')
        new_staff=Staffs(
            staff_id=formData['staff_id'],
            name=formData['name'],
            phone=formData['phone'],
            email=formData['email'],
            designation=formData['designation'],
            birthday=formData['birthday'],
            address=formData['address'],
            salary=formData['salary'],
            joined_date=formData['joined_date']
        )

        new_staff.save()
        return Response(status=status.HTTP_200_OK)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def fetchStaff(request):
    if request.method=="GET":
        staff_data=Staffs.objects.filter(deleted=False)    
        serialized_data=StaffDataSerializer(staff_data,many=True)
        return Response(status=status.HTTP_200_OK,data=serialized_data.data)
    

@api_view(['POST'])
@permission_classes([AllowAny])
def deleteStaff(request):
    if request.method=='POST':
        staffID=request.data.get('staffID') 
        staff=Staffs.objects.get(staff_id=staffID)
        if staff:
            staff.deleted=True
            staff.save()
            return Response(status=status.HTTP_200_OK)
        
@api_view(['POST'])
@permission_classes([AllowAny])
def editStaff(request):
    if request.method=='POST':
        formData=request.data.get('formData')
        staff_id=formData['staff_id']
        
        new_name=formData['name']
        new_phone=formData['phone']
        new_email=formData['email']
        new_designation=formData['designation']
        new_birthday=formData['birthday']
        new_address=formData['address']
        new_salary=formData['salary']
        new_joined_date=formData['joined_date']
        new_status=formData['status']

        selected_staff=Staffs.objects.get(staff_id=staff_id)

        if selected_staff:
            selected_staff.name=new_name
            selected_staff.phone=new_phone
            selected_staff.email=new_email
            selected_staff.designation=new_designation
            selected_staff.birthday=new_birthday
            selected_staff.address=new_address
            selected_staff.salary=new_salary
            selected_staff.joined_date=new_joined_date
            selected_staff.status=new_status

            selected_staff.save()

            return(Response(status=status.HTTP_200_OK))
        
@api_view(['POST'])
@permission_classes([AllowAny])
def fetchAttendance(request): 
    if request.method=='POST':
            selected_date=request.data.get('date')  
            selected_attendance=Attendance.objects.filter(date=selected_date)
            if selected_attendance:
                attendance_data=AttendanceDataSerializer(selected_attendance,many=True)
                return(Response(status=status.HTTP_200_OK,data=attendance_data.data))
            else:
                return(Response(status=status.HTTP_404_NOT_FOUND))
      


              