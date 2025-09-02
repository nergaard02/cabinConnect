from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Resident, SnowShoveling
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from django.utils import timezone

class ResidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resident
        fields = ["cabin_number"]
        
class UserSerializer(serializers.ModelSerializer):
    resident = ResidentSerializer()
    
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "resident"]
        extra_kwargs = {"password": {"write_only": True}}
    
    def create(self, validated_data):
        resident_data = validated_data.pop('resident')
        user = User.objects.create_user(**validated_data)
        Resident.objects.create(user=user, **resident_data)
        return user
    
class SnowShovelingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SnowShoveling
        fields = ["id", "person_ordered", "date", "note", "cabin_number"]
        extra_kwargs = {
            "person_ordered": {"read_only": True},
            "cabin_number": {"read_only": True}
        }
        

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
        
        except AuthenticationFailed:
            raise AuthenticationFailed("Invalid credentials")
        
        user = self.user
        
        if user.resident.is_verified == False:
            raise AuthenticationFailed("User is not verified")
        

        data["id"] = user.id
        data["token_expiration"] = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
        data["token_refresh_expiration"] = settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
        
        return data

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
            
        except AuthenticationFailed:
            raise AuthenticationFailed("Invalid refresh token")
        
        data['token_expiration'] = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
        data["token_refresh_expiration"] = settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
        
        return data
        

    
    