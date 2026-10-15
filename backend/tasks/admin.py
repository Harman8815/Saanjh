from django.contrib import admin
from .models import (
    Task, TaskStatus, TaskPriority, TaskCategory, TaskComment, TaskOccurrence,
    TaskTemplate, TaskTemplateItem,
)


@admin.register(TaskStatus)
class TaskStatusAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'order']
    list_editable = ['color', 'order']
    ordering = ['order', 'name']


@admin.register(TaskPriority)
class TaskPriorityAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'order']
    list_editable = ['color', 'order']
    ordering = ['order', 'name']


@admin.register(TaskCategory)
class TaskCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'color']
    list_editable = ['color']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'wedding', 'status', 'priority', 'category', 'assigned_to', 'due_date', 'progress']
    list_filter = ['status', 'priority', 'category', 'wedding']
    search_fields = ['title', 'description']
    list_editable = ['status', 'priority', 'category', 'assigned_to', 'progress']
    date_hierarchy = 'created_at'
    filter_horizontal = ['depends_on', 'tags']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('wedding', 'parent', 'title', 'description')
        }),
        ('Classification', {
            'fields': ('status', 'priority', 'category')
        }),
        ('Assignment & Dates', {
            'fields': ('assigned_to', 'due_date', 'completed_at')
        }),
        ('Progress & Dependencies', {
            'fields': ('progress', 'depends_on')
        }),
        ('Recurrence', {
            'fields': ('recurrence', 'recurrence_interval', 'recurrence_ends_on')
        }),
        ('Tags & Metadata', {
            'fields': ('tags', 'created_by')
        }),
    )


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author', 'created_at']
    search_fields = ['body', 'task__title', 'author__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TaskOccurrence)
class TaskOccurrenceAdmin(admin.ModelAdmin):
    list_display = ['task', 'scheduled_for', 'outcome', 'recorded_at']
    list_filter = ['outcome', 'scheduled_for']
    readonly_fields = ['recorded_at']


@admin.register(TaskTemplate)
class TaskTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']


@admin.register(TaskTemplateItem)
class TaskTemplateItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'template', 'offset_days', 'priority', 'category']
    list_filter = ['template', 'category']
    search_fields = ['title', 'template__name']
