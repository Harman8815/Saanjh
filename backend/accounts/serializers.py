from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Role, Settings, User


class RoleSerializer(serializers.ModelSerializer):
    """Serializer for Role model"""

    class Meta:
        model = Role
        fields = ['id', 'name']
        read_only_fields = ['id']


class SettingsSerializer(serializers.ModelSerializer):
    """Serializer for Settings model"""

    class Meta:
        model = Settings
        fields = ['id', 'theme', 'language', 'currency', 'timezone', 'notifications', 'privacy', 'preferences']
        read_only_fields = ['id']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""

    role = RoleSerializer(read_only=True)
    role_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    settings = SettingsSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone',
            'role', 'role_id', 'is_active', 'settings',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""

    username = serializers.CharField(validators=[])
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'password', 'password_confirm', 'role_id']

    def validate_username(self, value):
        cleaned = (value or '').strip()
        if not cleaned:
            raise serializers.ValidationError('Username is required')
        if User.objects.filter(username__iexact=cleaned).exists():
            raise serializers.ValidationError('Username already exists')
        if any(ch in cleaned for ch in ['@', '<', '>', ';', '--']):
            raise serializers.ValidationError('Username contains invalid characters')
        return cleaned

    def validate_email(self, value):
        cleaned = (value or '').strip()
        if not cleaned:
            raise serializers.ValidationError('Email is required')
        if User.objects.filter(email__iexact=cleaned).exists():
            raise serializers.ValidationError('Email already exists')
        return cleaned

    def validate_role_id(self, value):
        if value is None:
            return value
        if not Role.objects.filter(id=value).exists():
            raise serializers.ValidationError('Invalid role')
        return value

    def validate(self, attrs):
        password = attrs.get('password')
        confirm = attrs.get('password_confirm')
        if password and confirm and password != confirm:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match'})
        if password and confirm is None:
            return attrs
        if password and len(password) < 8:
            raise serializers.ValidationError({'password': 'Password must be at least 8 characters long'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        role_id = validated_data.pop('role_id', None)
        user = User.objects.create_user(**validated_data)
        if role_id:
            user.role_id = role_id
            user.save(update_fields=['role'])
        Settings.objects.get_or_create(user=user)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""

    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        username = (attrs.get('username') or '').strip()
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError({'non_field_errors': ['Must include username and password']})

        user = User.objects.filter(username__iexact=username).first()
        if not user and '@' in username:
            user = User.objects.filter(email__iexact=username).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError({'non_field_errors': ['Invalid credentials']})
        if not user.is_active:
            raise serializers.ValidationError({'non_field_errors': ['Account is inactive']})
        attrs['user'] = user
        return attrs


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'email']

    def validate_email(self, value):
        if not value:
            return value
        if User.objects.filter(email__iexact=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError('Email already exists')
        return value

    def validate_role_id(self, value):
        if value is None:
            return value
        if not Role.objects.filter(id=value).exists():
            raise serializers.ValidationError('Invalid role')
        return value


class SettingsUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user settings"""

    class Meta:
        model = Settings
        fields = ['theme', 'language', 'currency', 'timezone', 'notifications', 'privacy', 'preferences']

    def validate(self, attrs):
        """Reject unknown keys so client typos are not silently dropped."""
        allowed = set(self.Meta.fields)
        supplied = set(self.initial_data or {})
        unknown = supplied - allowed
        if unknown:
            raise serializers.ValidationError({
                field: ['Unrecognised setting: this key does not exist.']
                for field in sorted(unknown)
            })
        return attrs
