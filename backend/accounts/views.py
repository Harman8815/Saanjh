from rest_framework import status, generics, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.shortcuts import get_object_or_404
from .models import User, Role, Settings
from .serializers import (
    UserSerializer, UserRegistrationSerializer, 
    UserLoginSerializer, UserUpdateSerializer,
    RoleSerializer, SettingsSerializer, SettingsUpdateSerializer
)
from utils.api_response import APIResponse

class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return APIResponse.created({
            'user': UserSerializer(user).data,
            'token': token.key
        }, "User registered successfully")

class UserLoginView(generics.GenericAPIView):
    """User login endpoint"""
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # For API, we don't need to use login() since we use token authentication
        # login(request, user)  # This causes issues with API requests
        
        token, created = Token.objects.get_or_create(user=user)
        return APIResponse.success({
            'user': UserSerializer(user).data,
            'token': token.key
        }, "Login successful")

class UserLogoutView(generics.GenericAPIView):
    """User logout endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            request.user.auth_token.delete()
        except:
            pass
        logout(request)
        return APIResponse.success({}, "Successfully logged out")

class RoleViewSet(viewsets.ModelViewSet):
    """ViewSet for Role model"""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Roles retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Role created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Role retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Role updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Role deleted successfully")


class SettingsViewSet(viewsets.ModelViewSet):
    """ViewSet for Settings model"""
    serializer_class = SettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Settings.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return SettingsUpdateSerializer
        return SettingsSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Settings retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Settings created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Settings retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Settings updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Settings deleted successfully")


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view and update endpoint"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Profile retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return APIResponse.success(serializer.data, "Profile updated successfully")

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Get user statistics"""
    user = request.user
    try:
        wedding = user.wedding
        guest_count = wedding.guests.count()
        vendor_count = wedding.vendors.count()
        expense_total = sum(expense.actual_cost or expense.estimated_cost 
                          for expense in wedding.expenses.all())
        
        stats = {
            'guest_count': guest_count,
            'vendor_count': vendor_count,
            'expense_total': expense_total,
            'days_until_wedding': wedding.days_until_wedding(),
            'has_wedding': True
        }
        return APIResponse.success(stats, "Statistics retrieved successfully")
    except:
        stats = {
            'guest_count': 0,
            'vendor_count': 0,
            'expense_total': 0,
            'days_until_wedding': 0,
            'has_wedding': False
        }
        return APIResponse.success(stats, "Statistics retrieved successfully")


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def users_list(request):
    """Get list of users for task assignment"""
    users = User.objects.all().order_by('first_name', 'last_name')
    serializer = UserSerializer(users, many=True)
    return APIResponse.success(serializer.data, "Users retrieved successfully")

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def user_settings_detail(request):
    """Get or update user settings"""
    settings, created = Settings.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = SettingsSerializer(settings)
        return APIResponse.success(serializer.data, "Settings retrieved successfully")
    
    elif request.method == 'POST':
        serializer = SettingsUpdateSerializer(settings, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(serializer.data, "Settings updated successfully")
        return APIResponse.validation_error(
            [f"{field}: {', '.join(errors)}" for field, errors in serializer.errors.items()],
            "Settings validation failed"
        )
