from rest_framework import serializers
from django.utils import timezone
from .models import (
    Task, TaskStatus, TaskPriority, TaskCategory, TaskComment, TaskOccurrence,
    TaskTemplate, TaskTemplateItem,
)


def _validate_task_relationships(serializer, dependencies):
    request = serializer.context.get('request')
    wedding_id = serializer.instance.wedding_id if serializer.instance else getattr(
        getattr(request, 'user', None), 'wedding_id', None
    )
    for dependency in dependencies:
        if dependency.wedding_id != wedding_id:
            raise serializers.ValidationError('Dependencies must belong to this wedding.')
        if serializer.instance and _depends_on_task(dependency, serializer.instance.pk):
            raise serializers.ValidationError('This dependency would create a cycle.')
    return dependencies


def _depends_on_task(task, target_id):
    pending = [task]
    visited = set()
    while pending:
        current = pending.pop()
        if current.pk == target_id:
            return True
        if current.pk in visited:
            continue
        visited.add(current.pk)
        pending.extend(current.depends_on.all())
    return False


def _validate_parent(serializer, parent):
    if parent is None:
        return parent
    request = serializer.context.get('request')
    wedding_id = serializer.instance.wedding_id if serializer.instance else getattr(
        getattr(request, 'user', None), 'wedding_id', None
    )
    if parent.wedding_id != wedding_id:
        raise serializers.ValidationError('Parent task must belong to this wedding.')
    current = parent
    while current:
        if serializer.instance and current.pk == serializer.instance.pk:
            raise serializers.ValidationError('A task cannot be its own parent.')
        current = current.parent
    return parent


def validate_task_assignee(user, request=None):
    """
    Ensure a task is only ever assigned within the caller's wedding.

    A wedding has a single owner (``Wedding.user`` is a OneToOne), so the only
    permitted assignee is the requesting user. Without this check any user id
    could be assigned, which leaks their full name through ``assigned_to_name``.
    """
    if user is None:
        return None

    if request is None or not getattr(request, 'user', None):
        # Called outside a request context (e.g. a management command): keep
        # the historical behaviour rather than failing the whole operation.
        return user

    if user.pk != request.user.pk:
        raise serializers.ValidationError(
            'Tasks can only be assigned to users who belong to this wedding.'
        )
    return user


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
    subtasks = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'wedding', 'wedding_name', 'title', 'description',
            'status', 'status_name', 'priority', 'priority_name', 
            'category', 'category_name', 'assigned_to', 'assigned_to_name',
            'due_date', 'completed_at', 'progress', 'created_by', 
            'created_by_name', 'created_at', 'updated_at',
            'is_overdue', 'days_until_due', 'can_start',
            'tags', 'depends_on', 'dependent_tasks', 'subtasks', 'parent',
            'recurrence', 'recurrence_interval', 'recurrence_ends_on'
        ]
    
    def get_depends_on(self, obj):
        return TaskListSerializer(obj.depends_on.all(), many=True).data
    
    def get_dependent_tasks(self, obj):
        return TaskListSerializer(obj.dependent_tasks.all(), many=True).data

    def get_subtasks(self, obj):
        return TaskListSerializer(obj.subtasks.all(), many=True).data


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
    
    # Related objects
    tags = serializers.StringRelatedField(many=True, read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'status', 'status_name', 'priority', 'priority_name',
            'category', 'category_name', 'assigned_to', 'assigned_to_name',
            'due_date', 'progress', 'is_overdue', 'days_until_due', 'can_start',
            'tags', 'parent', 'recurrence', 'recurrence_interval', 'recurrence_ends_on'
        ]


class TaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tasks"""
    
    tags = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=True)
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'status', 'priority', 'category',
            'assigned_to', 'due_date', 'progress', 'depends_on', 'tags', 'parent',
            'recurrence', 'recurrence_interval', 'recurrence_ends_on'
        ]
    
    def validate_progress(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Progress must be between 0 and 100")
        return value

    def validate_due_date(self, value):
        # Allow past dates but warn about them in the frontend
        return value

    def validate_assigned_to(self, value):
        """Restrict assignees to users who share the caller's wedding."""
        return validate_task_assignee(value, self.context.get('request'))

    def validate_depends_on(self, value):
        return _validate_task_relationships(self, value)

    def validate_parent(self, value):
        return _validate_parent(self, value)

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
            'assigned_to', 'due_date', 'progress', 'depends_on', 'tags', 'parent',
            'recurrence', 'recurrence_interval', 'recurrence_ends_on'
        ]
    
    def validate_progress(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Progress must be between 0 and 100")
        return value

    def validate_assigned_to(self, value):
        """Restrict assignees to users who share the caller's wedding."""
        return validate_task_assignee(value, self.context.get('request'))

    def validate_depends_on(self, value):
        return _validate_task_relationships(self, value)

    def validate_parent(self, value):
        return _validate_parent(self, value)

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


class TaskCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)

    class Meta:
        model = TaskComment
        fields = ['id', 'body', 'author', 'author_name', 'created_at']
        read_only_fields = ['id', 'author', 'author_name', 'created_at']


class TaskOccurrenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskOccurrence
        fields = ['id', 'scheduled_for', 'outcome', 'recorded_at']
        read_only_fields = fields


class TaskTemplateItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    priority_name = serializers.CharField(source='priority.name', read_only=True)

    class Meta:
        model = TaskTemplateItem
        fields = ['id', 'title', 'description', 'offset_days', 'priority', 'priority_name', 'category', 'category_name']


class TaskTemplateSerializer(serializers.ModelSerializer):
    items = TaskTemplateItemSerializer(many=True, read_only=True)

    class Meta:
        model = TaskTemplate
        fields = ['id', 'name', 'description', 'items']
