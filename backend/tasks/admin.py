from django.contrib import admin
from .models import Task, TaskStatus, TaskPriority, TaskCategory


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
            'fields': ('wedding', 'title', 'description')
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
        ('Tags & Metadata', {
            'fields': ('tags', 'created_by')
        }),
    )
