from django.contrib.auth import logout
from rest_framework import generics, permissions, serializers, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes

from .models import Role, Settings, User
from .serializers import (
    RoleSerializer,
    SettingsSerializer,
    SettingsUpdateSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from utils.api_response import APIResponse


def _validation_message(detail, fallback):
    if isinstance(detail, dict):
        for value in detail.values():
            if isinstance(value, (list, tuple)) and value:
                return str(value[0])
            if value:
                return str(value)
    elif isinstance(detail, (list, tuple)) and detail:
        return str(detail[0])
    return fallback


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""

    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as exc:
            return APIResponse.validation_error(exc.detail, _validation_message(exc.detail, 'Registration validation failed'))
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return APIResponse.created({
            'user': UserSerializer(user).data,
            'token': token.key,
        }, 'Registration successful')


class UserLoginView(generics.GenericAPIView):
    """User login endpoint"""

    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as exc:
            detail = exc.detail
            messages = []
            if isinstance(detail, dict):
                for value in detail.values():
                    if isinstance(value, list):
                        messages.extend(str(item) for item in value)
                    else:
                        messages.append(str(value))
            else:
                messages = [str(detail)]
            if any('inactive' in m.lower() for m in messages):
                return APIResponse.unauthorized('Account is inactive')
            if any('invalid credentials' in m.lower() for m in messages):
                return APIResponse.unauthorized('Invalid credentials')
            return APIResponse.validation_error(detail if isinstance(detail, dict) else {'non_field_errors': messages}, 'Login validation failed')

        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return APIResponse.success({
            'user': UserSerializer(user).data,
            'token': token.key,
        }, 'Login successful')


class UserLogoutView(generics.GenericAPIView):
    """User logout endpoint"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            if hasattr(request.user, 'auth_token'):
                request.user.auth_token.delete()
        except Exception:
            pass
        logout(request)
        return APIResponse.success({}, 'Logout successful')


class RoleViewSet(viewsets.ModelViewSet):
    """ViewSet for Role model"""

    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, 'Roles retrieved successfully')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, 'Role created successfully')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, 'Role retrieved successfully')

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, 'Role updated successfully')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, 'Role deleted successfully')


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
        return APIResponse.success(serializer.data, 'Settings retrieved successfully')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, 'Settings created successfully')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, 'Settings retrieved successfully')

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, 'Settings updated successfully')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, 'Settings deleted successfully')


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
        return APIResponse.success(serializer.data, 'Profile retrieved successfully')

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return APIResponse.validation_error(
                serializer.errors,
                _validation_message(serializer.errors, 'Profile validation failed'),
            )
        serializer.save()
        return APIResponse.success(serializer.data, 'Profile updated successfully')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Get user statistics."""
    try:
        wedding = request.user.wedding
    except Exception:
        return APIResponse.success({
            'total_guests': 0,
            'total_vendors': 0,
            'total_expenses': 0,
            'wedding_date': None,
            'days_until_wedding': 0,
        }, 'User statistics retrieved successfully')

    stats = {
        'total_guests': wedding.guests.count(),
        'total_vendors': wedding.vendors.count(),
        'total_expenses': sum((expense.amount or 0) for expense in wedding.expenses.all()),
        'wedding_date': wedding.wedding_date.isoformat() if wedding.wedding_date else None,
        'days_until_wedding': wedding.days_until_wedding() if hasattr(wedding, 'days_until_wedding') else 0,
    }
    return APIResponse.success(stats, 'User statistics retrieved successfully')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def users_list(request):
    """Get list of users for task assignment."""
    users = User.objects.filter(pk=request.user.pk)
    serializer = UserSerializer(users, many=True)
    return APIResponse.success(serializer.data, 'Users retrieved successfully')


@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def user_settings_detail(request):
    """Get or update user settings."""
    settings, _ = Settings.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = SettingsSerializer(settings)
        return APIResponse.success(serializer.data, 'Settings retrieved successfully')

    serializer = SettingsUpdateSerializer(settings, data=request.data, partial=request.method == 'PATCH')
    if not serializer.is_valid():
        return APIResponse.validation_error(serializer.errors, 'Settings validation failed')
    serializer.save()
    return APIResponse.success(serializer.data, 'Settings updated successfully')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def refresh_token(request):
    """Refresh the user's auth token."""
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    new_token = Token.objects.create(user=request.user)
    return APIResponse.success({'token': new_token.key}, 'Token refreshed successfully')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Change the user's password."""
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not old_password or not new_password or not confirm_password:
        return APIResponse.validation_error({'non_field_errors': ['Old password, new password and confirmation are required']}, 'Old password, new password and confirmation are required')
    if not request.user.check_password(old_password):
        return APIResponse.validation_error({'old_password': ['Old password is incorrect']}, 'Old password is incorrect')
    if new_password != confirm_password:
        return APIResponse.validation_error({'confirm_password': ['Passwords do not match']}, 'Passwords do not match')
    if len(new_password) < 8:
        return APIResponse.validation_error({'new_password': ['Password must be at least 8 characters long']}, 'Password must be at least 8 characters long')
    request.user.set_password(new_password)
    request.user.save(update_fields=['password'])
    return APIResponse.success({}, 'Password changed successfully')


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Request a password reset email."""
    email = request.data.get('email')
    if not email:
        return APIResponse.validation_error({'email': ['Email is required']}, 'Password reset validation failed')
    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return APIResponse.validation_error({'email': ['Email not found']}, 'Email not found')
    return APIResponse.success({}, 'Password reset email sent')
