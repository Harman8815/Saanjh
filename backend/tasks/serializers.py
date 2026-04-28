from rest_framework import serializers
from django.utils import timezone
from .models import Task, TaskStatus, TaskPriority, TaskCategory


class TaskStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskStatus
        fields = ['id', 'name', 'color', 'order']


class TaskPrioritySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskPriority
        fields = ['id', 'name', 'color', 'order']


class TaskCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskCategory
        fields = ['id', 'name', 'description', 'color']


class TaskSerializer(serializers.ModelSerializer):
    """Detailed task serializer"""
    status_name = serializers.CharField(source='status.name', read_only=True)
    priority_name = serializers.CharField(source='priority.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    wedding_name = serializers.CharField(source='wedding.get_couple_name', read_only=True)
    
    # Calculated fields
    is_overdue = serializers.BooleanField(read_only=True)
    days_until_due = serializers.IntegerField(read_only=True)
    can_start = serializers.BooleanField(read_only=True)
    
    # Related objects
    tags = serializers.StringRelatedField(many=True, read_only=True)
    depends_on = serializers.SerializerMethodField()
    dependent_tasks = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'wedding', 'wedding_name', 'title', 'description',
            'status', 'status_name', 'priority', 'priority_name', 
            'category', 'category_name', 'assigned_to', 'assigned_to_name',
            'due_date', 'completed_at', 'progress', 'created_by', 
            'created_by_name', 'created_at', 'updated_at',
            'is_overdue', 'days_until_due', 'can_start',
            'tags', 'depends_on', 'dependent_tasks'
        ]
    
    def get_depends_on(self, obj):
        return TaskListSerializer(obj.depends_on.all(), many=True).data
    
    def get_dependent_tasks(self, obj):
        return TaskListSerializer(obj.dependent_tasks.all(), many=True).data


class TaskListSerializer(serializers.ModelSerializer):
    """Lightweight task serializer for lists"""
    status_name = serializers.CharField(source='status.name', read_only=True)
    priority_name = serializers.CharField(source='priority.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    # Calculated fields
    is_overdue = serializers.BooleanField(read_only=True)
    days_until_due = serializers.IntegerField(read_only=True)
    can_start = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'status', 'status_name', 'priority', 'priority_name',
            'category', 'category_name', 'assigned_to', 'assigned_to_name',
            'due_date', 'progress', 'is_overdue', 'days_until_due', 'can_start'
        ]


class TaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tasks"""
    
    tags = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=True)
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'status', 'priority', 'category',
            'assigned_to', 'due_date', 'progress', 'depends_on', 'tags'
        ]
    
    def validate_progress(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Progress must be between 0 and 100")
        return value
    
    def validate_due_date(self, value):
        # Allow past dates but warn about them in the frontend
        return value
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        
        # Create the task
        task = Task.objects.create(**validated_data)
        
        # Handle tags - create or get existing tags by name
        from documents.models import DocumentTag
        for tag_name in tags_data:
            tag, created = DocumentTag.objects.get_or_create(name=tag_name.strip())
            task.tags.add(tag)
        
        return task


class TaskUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating tasks"""
    
    tags = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=True)
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'status', 'priority', 'category',
            'assigned_to', 'due_date', 'progress', 'depends_on', 'tags'
        ]
    
    def validate_progress(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Progress must be between 0 and 100")
        return value
    
    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        
        # Update the task fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle tags if provided
        if tags_data is not None:
            instance.tags.clear()
            from documents.models import DocumentTag
            for tag_name in tags_data:
                tag, created = DocumentTag.objects.get_or_create(name=tag_name.strip())
                instance.tags.add(tag)
        
        return instance


class TaskBulkUpdateSerializer(serializers.Serializer):
    """Serializer for bulk updating tasks"""
    task_ids = serializers.ListField(child=serializers.IntegerField())
    updates = serializers.DictField()
    
    def validate_task_ids(self, value):
        if not value:
            raise serializers.ValidationError("At least one task ID is required")
        return value
