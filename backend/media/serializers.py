from rest_framework import serializers
from .models import Media, MediaType


class MediaTypeSerializer(serializers.ModelSerializer):
    """Serializer for MediaType model"""
    
    class Meta:
        model = MediaType
        fields = ['id', 'name']
        read_only_fields = ['id']


class MediaSerializer(serializers.ModelSerializer):
    """Serializer for Media model"""
    
    media_type = MediaTypeSerializer(read_only=True)
    media_type_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Media
        fields = [
            'id', 'title', 'file_url', 'thumbnail_url', 'file_size',
            'media_type', 'media_type_id', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at']


class MediaCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating media files"""
    
    class Meta:
        model = Media
        fields = [
            'title', 'file_url', 'thumbnail_url', 'file_size',
            'media_type_id'
        ]
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        media = Media.objects.create(wedding=wedding, **validated_data)
        return media


class MediaUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating media files"""
    
    class Meta:
        model = Media
        fields = [
            'title', 'file_url', 'thumbnail_url', 'file_size',
            'media_type_id'
        ]
