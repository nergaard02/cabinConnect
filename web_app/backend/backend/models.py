from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import datetime

class Resident(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,  related_name='resident')
    cabin_number = models.IntegerField(unique=True, null=False, blank=False)
    
    is_verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=6, blank=True, null=True)
    
    def generate_verification_code(self):
        from random import randint
        self.verification_code = f"{randint(0, 999999):06}"
        self.save()

class SnowShoveling(models.Model):
    person_ordered = models.ForeignKey(User,  on_delete=models.CASCADE, related_name='snow_shoveling_orders', null=False, blank=False)
    date = models.DateTimeField(blank=False, null=False)
    note = models.TextField(blank=True, null=True)
    cabin_number = models.IntegerField(blank=False, null=False)
    
