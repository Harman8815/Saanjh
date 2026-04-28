from django.contrib import admin
from .models import Media, MediaType, Album, MediaAlbum, AlbumTag


@admin.register(MediaType)
class MediaTypeAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'date', 'featured', 'image_count', 'video_count', 'created_at']
    list_filter = ['event_type', 'featured', 'created_at']
    search_fields = ['title', 'description']
    filter_horizontal = []
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AlbumTag)
class AlbumTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'album']
    search_fields = ['name']


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ['title', 'media_type', 'file_url', 'file_size', 'uploaded_at']
    list_filter = ['media_type', 'uploaded_at']
    search_fields = ['title']


@admin.register(MediaAlbum)
class MediaAlbumAdmin(admin.ModelAdmin):
    list_display = ['media', 'album', 'added_at']
    list_filter = ['added_at']
