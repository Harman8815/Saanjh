from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Role, Settings

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
        fields = ['id', 'theme', 'language', 'currency', 'timezone']
        read_only_fields = ['id']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    role = RoleSerializer(read_only=True)
    role_id = serializers.IntegerField(write_only=True)
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
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    role_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'phone',
            'password', 'password_confirm', 'role_id'
        ]
    
    def validate_role_id(self, value):
        if not Role.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid role")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Create default settings for the user
        Settings.objects.create(user=user)
        return user

class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'role_id', 'is_active'
        ]


class SettingsUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user settings"""
    
    class Meta:
        model = Settings
        fields = ['theme', 'language', 'currency', 'timezone']
