from django.contrib import admin
from accounts.models import User, Role, Settings
from weddings.models import Wedding, WeddingStatus, VenueCatalog, Venue
from guests.models import Guest, RsvpStatus, Table, Meal
from expenses.models import Expense, ExpenseStatus, BudgetCategory
from vendors.models import Vendor, VendorStatus, VendorCategory, VendorCatalog


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


@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    """Admin configuration for Guest model"""
    list_display = ['id', 'first_name', 'last_name', 'email', 'wedding', 'rsvp_status', 'relationship', 'table', 'invitation_sent']
    list_filter = ['rsvp_status', 'relationship', 'invitation_sent', 'reminder_sent', 'added_date']
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'wedding__bride_name', 'wedding__groom_name']
    ordering = ['last_name', 'first_name']
    readonly_fields = ['added_date', 'updated_at']
    date_hierarchy = 'added_date'
    list_per_page = 50

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff


@admin.register(RsvpStatus)
class RsvpStatusAdmin(admin.ModelAdmin):
    """Admin configuration for RsvpStatus model"""
    list_display = ['id', 'name']
    search_fields = ['name']

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    """Admin configuration for Table model"""
    list_display = ['id', 'wedding', 'table_number', 'capacity']
    list_filter = ['wedding']
    search_fields = ['wedding__bride_name', 'wedding__groom_name', 'table_number']
    ordering = ['wedding', 'table_number']

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff


@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
    """Admin configuration for Meal model"""
    list_display = ['id', 'name']
    search_fields = ['name']

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """Admin configuration for Expense model"""
    list_display = ['id', 'title', 'amount', 'paid_amount', 'wedding', 'budget_category', 'vendor', 'status', 'expense_date', 'due_date']
    list_filter = ['status', 'expense_date', 'due_date', 'budget_category', 'wedding']
    search_fields = ['title', 'notes', 'wedding__bride_name', 'wedding__groom_name', 'vendor__name']
    ordering = ['-expense_date', 'budget_category', 'title']
    readonly_fields = ['created_at', 'updated_at', 'remaining_balance', 'is_overdue']
    date_hierarchy = 'expense_date'
    list_per_page = 50

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff


@admin.register(ExpenseStatus)
class ExpenseStatusAdmin(admin.ModelAdmin):
    """Admin configuration for ExpenseStatus model"""
    list_display = ['id', 'name']
    search_fields = ['name']

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(BudgetCategory)
class BudgetCategoryAdmin(admin.ModelAdmin):
    """Admin configuration for BudgetCategory model"""
    list_display = ['id', 'wedding', 'name', 'allocated_amount']
    list_filter = ['wedding']
    search_fields = ['name', 'wedding__bride_name', 'wedding__groom_name']
    ordering = ['wedding', 'name']

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    """Admin configuration for Vendor model"""
    list_display = ['id', 'wedding', 'vendor_catalog', 'status', 'cost_estimate', 'actual_cost']
    list_filter = ['status', 'vendor_catalog__category']
    search_fields = ['vendor_catalog__name', 'wedding__bride_name', 'wedding__groom_name']
    ordering = ['vendor_catalog__category', 'vendor_catalog__name']

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff


@admin.register(VendorStatus)
class VendorStatusAdmin(admin.ModelAdmin):
    """Admin configuration for VendorStatus model"""
    list_display = ['id', 'name']
    search_fields = ['name']

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(VendorCategory)
class VendorCategoryAdmin(admin.ModelAdmin):
    """Admin configuration for VendorCategory model"""
    list_display = ['id', 'name']
    search_fields = ['name']

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(VendorCatalog)
class VendorCatalogAdmin(admin.ModelAdmin):
    """Admin configuration for VendorCatalog model"""
    list_display = ['id', 'name', 'category', 'contact', 'price_range', 'rating']
    list_filter = ['category']
    search_fields = ['name', 'contact']
    ordering = ['category', 'name']

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
