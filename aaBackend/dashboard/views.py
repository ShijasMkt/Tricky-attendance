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