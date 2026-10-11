from django.contrib.auth import logout
from rest_framework import generics, permissions, serializers, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.settings import api_settings

from . import services
from .cookies import clear_auth_cookies, set_auth_cookies, set_csrf_cookie
from .models import Role, Settings, User, UserSession
from .permissions import IsAdminOrReadOnly
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


def _finish_auth_response(response, payload, request=None):
    """
    Move tokens out of the JSON body and into HttpOnly cookies.

    The response payload is rewritten in place, then the Set-Cookie headers
    are added. Clients that explicitly ask for JSON transport keep the tokens
    in the body (useful for non-browser API consumers).
    """
    if request is not None and request.query_params.get('transport') == 'json':
        return response

    set_auth_cookies(
        response,
        access_token=payload.pop('access'),
        refresh_token=payload.pop('refresh'),
        access_lifetime=api_settings.ACCESS_TOKEN_LIFETIME,
        refresh_lifetime=api_settings.REFRESH_TOKEN_LIFETIME,
    )
    if request is not None:
        set_csrf_cookie(request, response)
    return response


def _auth_payload(user, request):
    """
    Build the authentication payload for a user.

    Issues a JWT access/refresh pair (with expiry metadata) backed by a
    tracked session, enforces the concurrent session limit, and keeps the
    legacy DRF token in the ``token`` field for older clients.
    """
    session_data = services.create_session(user, request)
    # Evict the oldest session if this sign-in exceeded the device limit.
    services.enforce_session_limit(user)

    token, _ = Token.objects.get_or_create(user=user)

    return {
        'user': UserSerializer(user).data,
        # Legacy field: older clients authenticate with this value.
        'token': token.key,
        # JWT credentials: short-lived access token + rotating refresh token.
        'access': session_data['access'],
        'refresh': session_data['refresh'],
        'expires_in': session_data['access_expires_in'],
        'session_id': str(session_data['session'].id),
    }


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
        payload = _auth_payload(user, request)
        response = APIResponse.created(payload, 'Registration successful')
        return _finish_auth_response(response, payload, request)


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
        payload = _auth_payload(user, request)
        response = APIResponse.success(payload, 'Login successful')
        return _finish_auth_response(response, payload, request)


class UserLogoutView(generics.GenericAPIView):
    """User logout endpoint"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh') if hasattr(request, 'data') else None
        # Cookie transport: the refresh token never reaches script, so it is
        # read from the HttpOnly cookie when not supplied in the body.
        if not refresh_token:
            refresh_token = request.COOKIES.get('refresh_token')
        all_devices = bool(request.data.get('all_devices')) if hasattr(request, 'data') else False

        # Server-side invalidation: blacklist the presented refresh token so it
        # can never be rotated again, even though JWTs are stateless.
        if refresh_token:
            session = services.find_session(refresh_token)
            if session is None:
                return APIResponse.unauthorized('Invalid or already revoked session')
            if all_devices:
                services.revoke_all_sessions(request.user)
            else:
                services.revoke_session(session)
        elif all_devices:
            services.revoke_all_sessions(request.user)

        try:
            if hasattr(request.user, 'auth_token'):
                request.user.auth_token.delete()
        except Exception:
            pass
        logout(request)
        response = APIResponse.success({}, 'Logout successful')
        clear_auth_cookies(response)
        return response


class RoleViewSet(viewsets.ModelViewSet):
    """ViewSet for Role model"""

    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    # Roles are shared reference data: only admins may modify them, otherwise
    # any user could create or rename roles and escalate their privileges.
    permission_classes = [IsAdminOrReadOnly]

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
@permission_classes([permissions.AllowAny])
def refresh_token(request):
    """
    Rotate the caller's credentials.

    With a ``refresh`` token in the body (or the refresh cookie for browsers),
    returns a new JWT access/refresh pair and blacklists the presented refresh
    token. Without one, falls back to rotating the legacy DRF token.
    """
    refresh_token_value = request.data.get('refresh') or request.COOKIES.get('refresh_token')

    if refresh_token_value:
        session = services.find_session(refresh_token_value)
        if session is None:
            return APIResponse.unauthorized('Invalid or already revoked session')
        try:
            rotated = services.rotate_session(refresh_token_value)
        except TokenError as exc:
            return APIResponse.unauthorized(str(exc))
        payload = {
            'token': rotated['access'],
            'access': rotated['access'],
            'refresh': rotated['refresh'],
            'expires_in': rotated['access_expires_in'],
        }
        response = APIResponse.success(payload, 'Token refreshed successfully')
        return _finish_auth_response(response, payload, request)

    # Legacy path: no refresh token supplied, rotate the DRF token instead.
    if not request.user or not request.user.is_authenticated:
        return APIResponse.unauthorized('Authentication required')

    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    new_token = Token.objects.create(user=request.user)
    return APIResponse.success({'token': new_token.key}, 'Token refreshed successfully')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def session_list(request):
    """List the caller's active sessions (devices)."""
    sessions = UserSession.objects.filter(user=request.user, is_active=True)
    current_session_id = str(getattr(request, 'auth_session_id', None) or '')
    data = [
        {
            'id': str(session.id),
            'device_name': session.device_name,
            'ip_address': session.ip_address,
            'created_at': session.created_at.isoformat(),
            'last_used_at': session.last_used_at.isoformat(),
            'current': str(session.id) == current_session_id,
        }
        for session in sessions
    ]
    return APIResponse.success(data, 'Sessions retrieved successfully')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def session_revoke(request, session_id):
    """Revoke a single session by id, blacklisting its refresh token."""
    session = UserSession.objects.filter(id=session_id, user=request.user).first()
    if session is None:
        return APIResponse.not_found('Session')
    services.revoke_session(session)
    return APIResponse.success({}, 'Session revoked successfully')


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
