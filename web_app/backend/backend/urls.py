from django.urls import path
from django.contrib import admin
from .views import CreateUserView, verifyCode, resendCode, CustomTokenObtainPairView, CreateSnowShovelingOrderView, SnowShovelingOrderListView, SnowShovelingOrderDeleteView, CustomTokenRefreshView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('resident/register/', CreateUserView.as_view(), name='resident-register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='get-token'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='refresh-token'),
    path('resident/verify/<str:email>/', verifyCode.as_view(), name='resident-verify-code'),
    path('resident/resend/code/<str:email>/', resendCode.as_view(), name='resident-resend-code'),
    path('order/snow_shoveling/', CreateSnowShovelingOrderView.as_view(), name='create-snow-shoveling-order'),
    path('snow_shoveling/orders/', SnowShovelingOrderListView.as_view(), name='list-snow-shoveling-orders'),
    path('snow_shoveling/order/delete/<int:pk>/', SnowShovelingOrderDeleteView.as_view(), name='delete-snow-shoveling-order'),
]
