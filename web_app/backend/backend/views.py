from rest_framework import generics, serializers
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, SnowShovelingSerializer, CustomTokenRefreshSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.mail import send_mail
from django.contrib.auth.models import User
from .models import Resident, SnowShoveling
from rest_framework.response import Response
from django.utils import timezone
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from datetime import date
from datetime import datetime

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        user = serializer.save()
        user.resident.generate_verification_code()
        user.resident.save()
        
        verification_link = "http://localhost:5173/verify/" + user.email
        
        send_mail(
            subject="CabinConnect Email Verification",
            message=(
                f"Your verification code is: {user.resident.verification_code}\n\n"
                f"You can also verify your account by clicking the following link:\n"
                f"{verification_link}\n\n"
                "If you did not register for an account, please ignore this email."
            ),
            from_email="no-reply@cabinconnect.com",
            recipient_list=[user.email],
            fail_silently=False,
        )

class verifyCode(generics.GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        code = request.data.get("code")
        user_mail = request.data.get("email")
        
        if not code or not user_mail:
            return Response({"message": "Email and code are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=user_mail)
            
            if user.resident.verification_code == code and not user.resident.is_verified:
                user.resident.is_verified = True
                user.resident.save()
                return Response({"message": "Verification successful"}, status=status.HTTP_200_OK)
                
            else:
                if user.resident.is_verified:
                    return Response({"message": "User is already verified"}, status=status.HTTP_400_BAD_REQUEST)
                
                elif (user.resident.verification_code != code):
                    return Response({"message": "Invalid verification code"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"message": "Verification failed"}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class resendCode(generics.GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def post(self, request, email, *args, **kwargs):
        try:
            user = User.objects.get(email=email)
            user.resident.generate_verification_code()
            user.resident.save()
            
            verification_link = "http://localhost:5173/verify/" + user.email
            
            send_mail(
                subject="CabinConnect Email Verification",
                message=(
                    f"Your verification code is: {user.resident.verification_code}\n\n"
                    f"You can also verify your account by clicking the following link:\n"
                    f"{verification_link}\n\n"
                    "If you did not register for an account, please ignore this email."
                ),
                from_email="no-reply@cabinconnect.com",
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response({"message": "Verification code resent successfully"}, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

class CreateSnowShovelingOrderView(generics.CreateAPIView):
    serializer_class = SnowShovelingSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        user = self.request.user
        
        if not hasattr(user, 'resident'):
            raise serializers.ValidationError("User is not a cabin resident")
        
        cabin_number = user.resident.cabin_number
        requested_date = serializer.validated_data.get("date")
        
        if requested_date.date() < date.today():
            raise serializers.ValidationError("Cannot create an order for a past date.")
        
        # Check if an order already exists for this cabin and date
        if SnowShoveling.objects.filter(cabin_number=cabin_number, date=requested_date).exists():
            raise serializers.ValidationError("A snow shoveling order already exists for this date.")
        
        if serializer.is_valid():
            serializer.save(person_ordered=user, cabin_number=cabin_number)

        else:
            print(serializer.errors)
            
class SnowShovelingOrderListView(generics.ListAPIView):
    serializer_class = SnowShovelingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        today = date.today()
        
        # Delete past orders
        SnowShoveling.objects.filter(person_ordered=user, date__lt=today).delete()
        
        return SnowShoveling.objects.filter(person_ordered=user, date__gte=today)
    
class SnowShovelingOrderDeleteView(generics.DestroyAPIView):
    serializer_class = SnowShovelingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return SnowShoveling.objects.filter(person_ordered=user)

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer
    permission_classes = [AllowAny]
    
    
    
    
    
            
        
