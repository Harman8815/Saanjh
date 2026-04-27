from rest_framework import serializers
from .models import Document, DocumentCategory, DocumentTag


class DocumentTagSerializer(serializers.ModelSerializer):
    """Serializer for DocumentTag model"""
    
    class Meta:
        model = DocumentTag
        fields = ['id', 'name']
        read_only_fields = ['id']


class DocumentCategorySerializer(serializers.ModelSerializer):
    """Serializer for DocumentCategory model"""
    
    class Meta:
        model = DocumentCategory
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model"""
    
    tags = DocumentTagSerializer(many=True, read_only=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False
    )
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    file_size_display = serializers.CharField(source='get_file_size_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'name', 'description', 'category', 'category_display',
            'file', 'file_url', 'file_type', 'file_size', 'file_size_display',
            'tags', 'tag_ids', 'tag_names',
            'uploaded_at', 'updated_at', 'uploaded_by', 'uploaded_by_name'
        ]
        read_only_fields = ['id', 'uploaded_at', 'updated_at', 'file_type', 'file_size']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        tag_names = validated_data.pop('tag_names', [])
        
        document = Document.objects.create(**validated_data)
        
        # Add tags by ID
        if tag_ids:
            document.tags.set(DocumentTag.objects.filter(id__in=tag_ids))
        
        # Create and add tags by name
        if tag_names:
            for tag_name in tag_names:
                tag, created = DocumentTag.objects.get_or_create(name=tag_name.lower().strip())
                document.tags.add(tag)
        
        return document
    
    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        tag_names = validated_data.pop('tag_names', None)
        
        # Update regular fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update tags if provided
        if tag_ids is not None:
            instance.tags.set(DocumentTag.objects.filter(id__in=tag_ids))
        
        if tag_names:
            for tag_name in tag_names:
                tag, created = DocumentTag.objects.get_or_create(name=tag_name.lower().strip())
                instance.tags.add(tag)
        
        return instance


class DocumentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating documents with file upload"""
    
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True,
        write_only=True
    )
    file = serializers.FileField(required=True)
    
    class Meta:
        model = Document
        fields = [
            'name', 'description', 'category', 'file', 'tag_names'
        ]
    
    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        wedding = self.context['request'].user.wedding
        uploaded_by = self.context['request'].user
        
        document = Document.objects.create(
            wedding=wedding,
            uploaded_by=uploaded_by,
            **validated_data
        )
        
        # Create and add tags
        if tag_names:
            for tag_name in tag_names:
                if tag_name:  # Only create non-empty tags
                    tag, created = DocumentTag.objects.get_or_create(name=tag_name.lower().strip())
                    document.tags.add(tag)
        
        return document


class DocumentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating documents"""
    
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Document
        fields = [
            'name', 'description', 'category', 'tag_names'
        ]
    
    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        
        # Update regular fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update tags if provided
        if tag_names is not None:
            instance.tags.clear()
            for tag_name in tag_names:
                tag, created = DocumentTag.objects.get_or_create(name=tag_name.lower().strip())
                    instance.tags.add(tag)
        
        return instance


class DocumentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for document lists"""
    
    tags = DocumentTagSerializer(many=True, read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    file_size_display = serializers.CharField(source='get_file_size_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'name', 'category', 'category_display',
            'file_url', 'file_type', 'file_size_display',
            'tags', 'uploaded_at'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
