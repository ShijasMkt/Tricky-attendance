from django.db import models

# Create your models here.

class Users(models.Model):
    name=models.CharField(max_length=20)
    password=models.CharField(max_length=20)
    
class Staffs(models.Model):
    staff_id=models.CharField(max_length=20)
    name=models.CharField(max_length=20)
    phone=models.CharField(max_length=15)
    email=models.CharField(max_length=30)
    designation=models.CharField(max_length=20)
    birthday=models.DateField()
    address=models.TextField()
    salary=models.IntegerField()
    joined_date=models.DateField() 
    deleted=models.BooleanField(default=False)