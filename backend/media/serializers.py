from rest_framework import serializers
from .models import Media, MediaType, Album, MediaAlbum, AlbumTag


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
        
        album = Album.objects.create(wedding=wedding, **validated_data)
        
        # Create tags
        for tag_name in tag_names:
            if tag_name:
                AlbumTag.objects.create(album=album, name=tag_name.lower().strip())
        
        return album
    
    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update tags if provided
        if tag_names is not None:
            instance.tags.all().delete()
            for tag_name in tag_names:
                if tag_name:
                    AlbumTag.objects.create(album=instance, name=tag_name.lower().strip())
        
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
    
    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        wedding = self.context['request'].user.wedding
        
        album = Album.objects.create(wedding=wedding, **validated_data)
        
        # Create tags
        for tag_name in tag_names:
            if tag_name:
                AlbumTag.objects.create(album=album, name=tag_name.lower().strip())
        
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
            instance.tags.all().delete()
            for tag_name in tag_names:
                if tag_name:
                    AlbumTag.objects.create(album=instance, name=tag_name.lower().strip())
        
        return instance


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


class MediaAlbumSerializer(serializers.ModelSerializer):
    """Serializer for MediaAlbum join model"""
    
    media = MediaSerializer(read_only=True)
    media_id = serializers.IntegerField(write_only=True)
    album_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MediaAlbum
        fields = ['id', 'media', 'media_id', 'album_id', 'added_at']
        read_only_fields = ['id', 'added_at']
