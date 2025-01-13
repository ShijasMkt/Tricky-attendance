from rest_framework import serializers
from dashboard.models import *



class StaffDataSerializer(serializers.ModelSerializer):

    class Meta:

        model = Staffs

        fields = '__all__'