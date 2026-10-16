from io import BytesIO
import os
from django.core.files.base import ContentFile
from PIL import Image, ImageOps
from utils.uploads import validate_media_url, validate_uploaded_file
from rest_framework import serializers
from .models import Media, MediaType, Album, MediaAlbum, AlbumTag


def _set_album_tags(album, tag_names):
    tags = []
    for name in dict.fromkeys(value.strip().lower() for value in tag_names if value.strip()):
        tag, _ = AlbumTag.objects.get_or_create(wedding=album.wedding, name=name)
        tags.append(tag)
    album.tags.set(tags)


def _optimize_image(media, upload):
    with Image.open(upload) as source:
        image = ImageOps.exif_transpose(source)
        image.thumbnail((2048, 2048), Image.Resampling.LANCZOS)
        width, height = image.size
        image = image.convert('RGB')
        buffer = BytesIO()
        image.save(buffer, format='WEBP', quality=82, method=6)
        stem = os.path.splitext(os.path.basename(upload.name))[0]
        media.file.save(f'{stem}.webp', ContentFile(buffer.getvalue()), save=False)

        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        thumbnail_buffer = BytesIO()
        image.save(thumbnail_buffer, format='WEBP', quality=82, method=6)
        media.thumbnail.save(f'{stem}_thumb.webp', ContentFile(thumbnail_buffer.getvalue()), save=False)
        media.width = width
        media.height = height
        media.file_size = media.file.size
        media.save(update_fields=['file', 'thumbnail', 'width', 'height', 'file_size'])


class MediaTypeSerializer(serializers.ModelSerializer):
    """Serializer for MediaType model"""
    
    class Meta:
        model = MediaType
        fields = ['id', 'name']
        read_only_fields = ['id']


class AlbumTagSerializer(serializers.ModelSerializer):
    """Serializer for AlbumTag model"""
    
    class Meta:
        model = AlbumTag
        fields = ['id', 'name']
        read_only_fields = ['id']


class AlbumListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for album lists"""
    
    tags = AlbumTagSerializer(many=True, read_only=True)
    image_count = serializers.ReadOnlyField()
    video_count = serializers.ReadOnlyField()
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    
    class Meta:
        model = Album
        fields = [
            'id', 'title', 'description', 'event_type', 'event_type_display',
            'date', 'cover_image', 'featured', 'tags',
            'image_count', 'video_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AlbumSerializer(serializers.ModelSerializer):
    """Full serializer for Album model"""
    
    tags = AlbumTagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False
    )
    image_count = serializers.ReadOnlyField()
    video_count = serializers.ReadOnlyField()
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    media_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Album
        fields = [
            'id', 'title', 'description', 'event_type', 'event_type_display',
            'date', 'cover_image', 'featured', 'tags', 'tag_names',
            'image_count', 'video_count', 'media_items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_media_items(self, obj):
        """Get media items in album"""
        media_links = obj.media_items.select_related('media').all()[:50]  # Limit to 50 for performance
        return MediaSerializer([link.media for link in media_links], many=True).data
    
    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        wedding = self.context['request'].user.wedding
        validated_data.pop('wedding', None)
        
        album = Album.objects.create(wedding=wedding, **validated_data)
        
        _set_album_tags(album, tag_names)
        
        return album
    
    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update tags if provided
        if tag_names is not None:
            _set_album_tags(instance, tag_names)
        
        return instance


class AlbumCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating albums"""
    
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False
    )
    
    class Meta:
        model = Album
        fields = ['title', 'description', 'event_type', 'date', 'cover_image', 'featured', 'tag_names']
        read_only_fields = ['wedding']
    
    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        wedding = self.context['request'].user.wedding
        validated_data.pop('wedding', None)
        
        album = Album.objects.create(wedding=wedding, **validated_data)
        
        _set_album_tags(album, tag_names)
        
        return album


class AlbumUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating albums"""
    
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False
    )
    
    class Meta:
        model = Album
        fields = ['title', 'description', 'event_type', 'date', 'cover_image', 'featured', 'tag_names']
    
    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update tags if provided
        if tag_names is not None:
            _set_album_tags(instance, tag_names)
        
        return instance


class MediaSerializer(serializers.ModelSerializer):
    """Serializer for Media model"""
    
    media_type = MediaTypeSerializer(read_only=True)
    media_type_id = serializers.IntegerField(write_only=True)
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Media
        fields = [
            'id', 'title', 'file_url', 'thumbnail_url', 'file_size',
            'media_type', 'media_type_id', 'uploaded_at', 'width', 'height',
            'is_guest_submission', 'submitted_by_name', 'submitted_by_email',
            'submission_status'
        ]
        read_only_fields = ['id', 'uploaded_at']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return obj.file_url

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        return obj.thumbnail_url


class MediaCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating media files"""

    file = serializers.FileField(required=False, write_only=True)
    file_url = serializers.URLField(required=False, allow_blank=True)

    def validate_file(self, value):
        return validate_uploaded_file(value, group='images')

    def validate(self, attrs):
        if not attrs.get('file') and not attrs.get('file_url'):
            raise serializers.ValidationError({'file': 'Provide an image upload or an external file URL.'})
        return attrs

    class Meta:
        model = Media
        fields = [
            'title', 'file', 'file_url', 'thumbnail_url', 'file_size', 'media_type_id'
        ]

    def validate_file_url(self, value):
        """Only http(s) URLs: prevents javascript: and data: injection."""
        return validate_media_url(value, 'file_url')

    def validate_thumbnail_url(self, value):
        return validate_media_url(value, 'thumbnail_url')

    def create(self, validated_data):
        upload = validated_data.pop('file', None)
        wedding = self.context['request'].user.wedding
        validated_data.pop('wedding', None)
        media = Media.objects.create(wedding=wedding, **validated_data)
        if upload:
            _optimize_image(media, upload)
        return media


class MediaUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating media files"""

    class Meta:
        model = Media
        fields = [
            'title', 'file', 'file_url', 'thumbnail_url', 'file_size', 'media_type_id'
        ]

    def validate_file_url(self, value):
        """Only http(s) URLs: prevents javascript: and data: injection."""
        return validate_media_url(value, 'file_url')

    def validate_thumbnail_url(self, value):
        return validate_media_url(value, 'thumbnail_url')

    def validate_file(self, value):
        return validate_uploaded_file(value, group='images')

    def update(self, instance, validated_data):
        upload = validated_data.pop('file', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if upload:
            _optimize_image(instance, upload)
        else:
            instance.save()
        return instance


class MediaAlbumSerializer(serializers.ModelSerializer):
    """Serializer for MediaAlbum join model"""
    
    media = MediaSerializer(read_only=True)
    media_id = serializers.IntegerField(write_only=True)
    album_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MediaAlbum
        fields = ['id', 'media', 'media_id', 'album_id', 'added_at']
        read_only_fields = ['id', 'added_at']
