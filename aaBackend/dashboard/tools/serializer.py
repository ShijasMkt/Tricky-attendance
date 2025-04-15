from rest_framework import serializers
from dashboard.models import *



class StaffImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffImages
        fields = ['id', 'image', 'uploaded_at']

class StaffDataSerializer(serializers.ModelSerializer):
    images = StaffImageSerializer(many=True, read_only=True)

    class Meta:
        model = Staffs
        fields = [
            'id',
            'staff_id', 'name', 'phone', 'email', 'designation',
            'birthday', 'address', 'salary', 'joined_date',
            'deleted', 'status', 'images'
        ]

class AttendanceDataSerializer(serializers.ModelSerializer):
    class Meta:
        model=Attendance
        fields='__all__'        