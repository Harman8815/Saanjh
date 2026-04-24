from django.contrib import admin
from accounts.models import User, Role, Settings


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Admin configuration for User model"""
    list_display = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'created_at']
    list_filter = ['is_staff', 'is_active', 'role']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Admin configuration for Role model"""
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    """Admin configuration for Settings model"""
    list_display = ['id', 'user', 'theme', 'language', 'currency', 'timezone']
    list_filter = ['theme', 'language']
    search_fields = ['user__username']
