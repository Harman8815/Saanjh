from django.contrib import admin
from django.utils import timezone
from accounts.models import User, Role, Settings
from weddings.models import Wedding, WeddingStatus, VenueCatalog, Venue
from guests.models import Guest, RsvpStatus, Table, Meal
from expenses.models import Expense, ExpenseStatus, BudgetCategory
from vendors.models import Vendor, VendorStatus, VendorCategory, VendorCatalog
from timeline.models import Timeline, TimelineEvent, TimelineStatus


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

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'status')

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
    actions = ['mark_rsvp_confirmed', 'send_invitation_reminder']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('wedding', 'rsvp_status', 'table')

    def mark_rsvp_confirmed(self, request, queryset):
        """Mark selected guests as RSVP confirmed"""
        confirmed_status = RsvpStatus.objects.filter(name='confirmed').first()
        if confirmed_status:
            updated = queryset.update(rsvp_status=confirmed_status, rsvp_date=timezone.now().date())
            self.message_user(request, f'{updated} guests marked as RSVP confirmed.')
        else:
            self.message_user(request, 'RSVP confirmed status not found.', level='error')
    mark_rsvp_confirmed.short_description = 'Mark selected guests as RSVP confirmed'

    def send_invitation_reminder(self, request, queryset):
        """Mark selected guests as reminder sent"""
        updated = queryset.update(reminder_sent=True, reminder_sent_date=timezone.now())
        self.message_user(request, f'{updated} guests marked as reminder sent.')
    send_invitation_reminder.short_description = 'Send invitation reminder to selected guests'

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
    actions = ['mark_as_paid']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('wedding', 'budget_category', 'vendor', 'status')

    def mark_as_paid(self, request, queryset):
        """Mark selected expenses as fully paid"""
        paid_status = ExpenseStatus.objects.filter(name='paid').first()
        if paid_status:
            updated_count = 0
            for expense in queryset:
                expense.paid_amount = expense.amount
                expense.status = paid_status
                expense.paid_date = timezone.now().date()
                expense.save()
                updated_count += 1
            self.message_user(request, f'{updated_count} expenses marked as fully paid.')
        else:
            self.message_user(request, 'Paid status not found.', level='error')
    mark_as_paid.short_description = 'Mark selected expenses as fully paid'

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

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('wedding', 'vendor_catalog', 'status')

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


@admin.register(Timeline)
class TimelineAdmin(admin.ModelAdmin):
    """Admin configuration for Timeline model"""
    list_display = ['id', 'wedding', 'name']
    list_filter = ['wedding']
    search_fields = ['name', 'wedding__bride_name', 'wedding__groom_name']

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff


@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    """Admin configuration for TimelineEvent model"""
    list_display = ['id', 'title', 'timeline', 'event_date', 'start_time', 'end_time', 'status']
    list_filter = ['status', 'event_date']
    search_fields = ['title', 'timeline__name', 'timeline__wedding__bride_name', 'timeline__wedding__groom_name']
    ordering = ['event_date', 'start_time']
    date_hierarchy = 'event_date'
    list_per_page = 50

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('timeline', 'timeline__wedding', 'status')

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff


@admin.register(TimelineStatus)
class TimelineStatusAdmin(admin.ModelAdmin):
    """Admin configuration for TimelineStatus model"""
    list_display = ['id', 'name']
    search_fields = ['name']

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
