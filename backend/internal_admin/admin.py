from django.contrib import admin
from accounts.models import User, Role, Settings


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Admin configuration for User model"""
    list_display = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_superuser', 'is_active', 'created_at']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'role', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    fieldsets = (
        ('User Information', {
            'fields': ('username', 'email', 'first_name', 'last_name', 'phone')
        }),
        ('Authentication', {
            'fields': ('password',)
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'role')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'created_at', 'updated_at')
        }),
    )
    date_hierarchy = 'created_at'
    list_per_page = 25

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        if obj and not request.user.is_superuser:
            return False
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        if obj and not request.user.is_superuser:
            return False
        return request.user.is_superuser


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Admin configuration for Role model"""
    list_display = ['id', 'name']
    search_fields = ['name']

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    """Admin configuration for Settings model"""
    list_display = ['id', 'user', 'theme', 'language', 'currency', 'timezone']
    list_filter = ['theme', 'language']
    search_fields = ['user__username']

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        if obj and not request.user.is_superuser:
            return False
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
