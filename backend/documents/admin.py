from django.contrib import admin
from .models import Document, DocumentCategory, DocumentTag


@admin.register(DocumentCategory)
class DocumentCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(DocumentTag)
class DocumentTagAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'wedding', 'file_type', 'file_size', 'uploaded_at']
    list_filter = ['category', 'file_type', 'uploaded_at']
    search_fields = ['name', 'description']
    filter_horizontal = ['tags']
    readonly_fields = ['file_type', 'file_size', 'uploaded_at', 'updated_at']
