from django.contrib import admin

from .models import Reminder


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'wedding', 'kind', 'channel', 'scheduled_for',
        'status', 'sent_at',
    )
    list_filter = ('status', 'kind', 'channel')
    search_fields = ('to_email', 'subject')
    readonly_fields = ('created_at', 'updated_at', 'sent_at', 'claimed_at')
    date_hierarchy = 'scheduled_for'
