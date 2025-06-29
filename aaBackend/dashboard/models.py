from django.db import models
import os
import shutil
from django.contrib.auth.models import AbstractBaseUser,BaseUserManager
from django.contrib.auth.hashers import make_password

from aaBackend import settings
# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, name, password=None):
        if not name:
            raise ValueError("Users must have an user name")
        user = self.model(name=name)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
class Users(AbstractBaseUser):
    name=models.CharField(max_length=20,unique=True)
    is_active=models.BooleanField(default=True)

    objects=UserManager()

    USERNAME_FIELD = 'name'
    
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
    status=models.BooleanField(default=True)

    

class StaffImages(models.Model):
    staff = models.ForeignKey(Staffs, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='upload/staffs/images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)  

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.image:
            source_path = self.image.path
            backup_root = os.path.join(settings.MEDIA_ROOT, 'dataset/staffs')

            folder_name = f"{self.staff.staff_id}_{self.staff.name.replace(' ', '_')}"
            staff_folder = os.path.join(backup_root, folder_name)

            if not os.path.exists(staff_folder):
                os.makedirs(staff_folder)

            destination_path = os.path.join(staff_folder, os.path.basename(source_path))
            shutil.copy2(source_path, destination_path)


class Attendance(models.Model):
    ATTENDANCE_STATUS = [
        ('P', 'Present'),
        ('A', 'Absent'),
        ('L', 'Leave'),
    ]

    staff = models.ForeignKey(Staffs, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=1, choices=ATTENDANCE_STATUS, default='A')
    timestamp = models.DateTimeField(auto_now_add=True)
    remarks=models.TextField(null=True)

    class Meta:
        unique_together = ('staff', 'date')  
        ordering = ['-date']    