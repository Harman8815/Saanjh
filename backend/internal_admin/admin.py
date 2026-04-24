from django.contrib import admin
from accounts.models import User, Role, Settings
from weddings.models import Wedding, WeddingStatus, VenueCatalog, Venue


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


@admin.register(Wedding)
class WeddingAdmin(admin.ModelAdmin):
    """Admin configuration for Wedding model"""
    list_display = ['id', 'user', 'bride_name', 'groom_name', 'wedding_date', 'status']
    list_filter = ['status', 'wedding_date']
    search_fields = ['bride_name', 'groom_name', 'user__username', 'user__email']
    ordering = ['-wedding_date']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'wedding_date'
    list_per_page = 25

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(WeddingStatus)
class WeddingStatusAdmin(admin.ModelAdmin):
    """Admin configuration for WeddingStatus model"""
    list_display = ['id', 'name']
    search_fields = ['name']

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(VenueCatalog)
class VenueCatalogAdmin(admin.ModelAdmin):
    """Admin configuration for VenueCatalog model"""
    list_display = ['id', 'name', 'type', 'capacity_min', 'capacity_max', 'price', 'rating']
    list_filter = ['type']
    search_fields = ['name', 'address']
    ordering = ['name']

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    """Admin configuration for Venue model"""
    list_display = ['id', 'venue_catalog']
    search_fields = ['venue_catalog__name']

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff
