from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from django.contrib.auth import authenticate
from .tools.serializer import *
from django.core.files.storage import default_storage
from django.utils.dateparse import parse_date, parse_datetime
from django.utils.timezone import now
from .tools.face_rec import extract_face_encodings,save_encodings_and_classifier,recognize_and_mark




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
        
        user=authenticate(request,name=user_name,password=password)

        if user:
            tokens=get_tokens_for_user(user)
            return Response({'access': tokens['access'], 'refresh': tokens['refresh']})
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def fetchStaff(request):
    if request.method=="GET":
        staff_data=Staffs.objects.filter(deleted=False)    
        serialized_data=StaffDataSerializer(staff_data,many=True)
        return Response(status=status.HTTP_200_OK,data=serialized_data.data)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deleteStaff(request):
    if request.method=='POST':
        staffID=request.data.get('staffID') 
        staff=Staffs.objects.get(staff_id=staffID)
        if staff:
            staff.deleted=True
            staff.save()
            return Response(status=status.HTTP_200_OK)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def fetchAttendance(request):
    if request.method == 'POST':
        selected_date = request.data.get('date')  
        
        selected_attendance = Attendance.objects.select_related('staff').filter(date=selected_date)

        if not selected_attendance.exists():
            return Response({"error": "No attendance records found for the selected date."}, status=status.HTTP_404_NOT_FOUND)

        all_attendance = []
        for record in selected_attendance:
            
            staff_serializer = StaffDataSerializer(record.staff)

            
            attendance_data = {
                "staff_id": record.staff.id,
                "staff_name": record.staff.name,
                "date": record.date,
                "status": record.status,
                "staff_data": staff_serializer.data,  
                "time":record.timestamp,
                "remarks":record.remarks
            }
            all_attendance.append(attendance_data)

        return Response(all_attendance, status=status.HTTP_200_OK)

            
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def markAttendance(request): 
    if request.method=='POST':
        formData=request.data.get('data')
        staff_id=formData['staff_id']
        date=formData['date']
        attendance_status=formData['status']
        selected_staff=Staffs.objects.get(id=staff_id)

        selected_attendance=Attendance.objects.filter(staff_id=staff_id,date=date).first()

        if selected_attendance:
            selected_attendance.status=attendance_status
            selected_attendance.save()
            return(Response(status=status.HTTP_200_OK))
        
        else:
            new_attendance=Attendance(
                staff=selected_staff,
                date=date,
                status=attendance_status
            )
            new_attendance.save()
            return(Response(status=status.HTTP_200_OK))

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def markLeave(request): 
    if request.method=='POST':
        formData=request.data.get('data')
        staff_id=formData['staff_id']
        date=formData['date']
        attendance_status=formData['status'] 
        reason=formData['reason']     
        attendance_status=formData['status']
        selected_staff=Staffs.objects.get(id=staff_id)
                       
        selected_attendance=Attendance.objects.filter(staff_id=staff_id,date=date).first()

        if selected_attendance:
            selected_attendance.status=attendance_status
            selected_attendance.remarks=reason
            selected_attendance.save()
            return(Response(status=status.HTTP_200_OK))
        
        else:
            new_attendance=Attendance(
                staff=selected_staff,
                date=date,
                status=attendance_status,
                remarks=reason
            )
            new_attendance.save()
            return(Response(status=status.HTTP_200_OK))
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def updateAttendance(request):    
     
    date_str = request.data.get('date')
    attendance_data = request.data.get('data')


    if not date_str or not attendance_data:
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

    for item in attendance_data:
        staff_id = item.get('staff_id')
        status_val = item.get('status')
        timestamp_str = item.get('timestamp')

        if not all([staff_id, status_val]):
            continue  # Skip incomplete entries
    
        try:
            staff = Staffs.objects.get(id=staff_id)
        except Staffs.DoesNotExist:
            continue  # Skip if staff not found

        
        
        # Parse date and datetime
        date = parse_date(date_str)
        timestamp = parse_datetime(timestamp_str) if timestamp_str else now()


        # Update or create attendance record
        attendance, created = Attendance.objects.update_or_create(
            staff=staff,
            date=date,
            defaults={
                'status': status_val,
                'timestamp': timestamp,
            }
        )

    return Response({'success': 'Attendance updated successfully!'}, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def uploadStaffImg(request): 
    if request.method=="POST":
        data = request.data
        staff_id = data.get('staffID')
        staff_selected = Staffs.objects.filter(id=staff_id).first()
        if staff_selected:
            img = request.FILES.get('img')
            if img:
                StaffImages.objects.create(staff=staff_selected, image=img)
                encodings, labels = extract_face_encodings()  # Get encodings and labels
                save_encodings_and_classifier(encodings, labels) 
                return Response(status=status.HTTP_200_OK)
            else:
                return Response({"error": "Image not provided"}, status=status.HTTP_400_BAD_REQUEST)
              

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deleteStaffImg(request): 
    if request.method=='POST':
        image_id=request.data.get('imageId')      
        staff_id=request.data.get('staffId')

        selected_img=StaffImages.objects.filter(id=image_id,staff_id=staff_id).first()

        if selected_img:
            file_path = selected_img.image.path  

            selected_img.delete()

            if default_storage.exists(file_path):
                default_storage.delete(file_path)

            return Response(status=status.HTTP_200_OK)
        else:
            return Response({"error": "Image Not found"}, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def faceRecognitionAttendance(request):
    image_file=request.FILES.get("image")
    if not image_file:
        return Response({"success": False, "message": "No image uploaded"}, status=400)
    
    import numpy as np
    import cv2
    file_bytes = np.asarray(bytearray(image_file.read()), dtype=np.uint8)
    frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    # Use your existing pipeline with `frame`
    result = recognize_and_mark(frame)

    return Response(result)    

        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetchTotalEmployees(request):
    total_employees=Staffs.objects.filter(deleted=False).count()
    return Response(total_employees,status=status.HTTP_200_OK)