from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Q, Prefetch
from django.utils import timezone

from .models import Task, TaskStatus, TaskPriority, TaskCategory
from .serializers import (
    TaskSerializer, TaskListSerializer, TaskCreateSerializer, TaskUpdateSerializer,
    TaskStatusSerializer, TaskPrioritySerializer, TaskCategorySerializer,
    TaskBulkUpdateSerializer
)
from utils.api_response import APIResponse


class TaskStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for TaskStatus model"""
    queryset = TaskStatus.objects.all()
    serializer_class = TaskStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['order', 'name']
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Task statuses retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Task status created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Task status retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Task status updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Task status deleted successfully")


class TaskPriorityViewSet(viewsets.ModelViewSet):
    """ViewSet for TaskPriority model"""
    queryset = TaskPriority.objects.all()
    serializer_class = TaskPrioritySerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['order', 'name']
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Task priorities retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Task priority created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Task priority retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Task priority updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Task priority deleted successfully")


class TaskCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for TaskCategory model"""
    queryset = TaskCategory.objects.all()
    serializer_class = TaskCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['name']
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Task categories retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Task category created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Task category retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Task category updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Task category deleted successfully")


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet for Task model"""
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'title', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Task.objects.filter(wedding=self.request.user.wedding).select_related(
            'status', 'priority', 'category', 'assigned_to', 'created_by', 'wedding'
        ).prefetch_related('tags', 'depends_on', 'dependent_tasks')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        elif self.action == 'list':
            return TaskListSerializer
        return TaskSerializer
    
    def perform_create(self, serializer):
        serializer.save(wedding=self.request.user.wedding, created_by=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filter by tags if provided
        tags = request.query_params.getlist('tags')
        if tags:
            queryset = queryset.filter(tags__name__in=tags).distinct()
        
        # Filter by date range
        due_date_from = request.query_params.get('due_date_from')
        due_date_to = request.query_params.get('due_date_to')
        if due_date_from:
            queryset = queryset.filter(due_date__gte=due_date_from)
        if due_date_to:
            queryset = queryset.filter(due_date__lte=due_date_to)
        
        # Filter by completion status
        is_completed = request.query_params.get('is_completed')
        if is_completed is not None:
            completed_status = TaskStatus.objects.filter(name__iexact='completed').first()
            if completed_status:
                if is_completed.lower() == 'true':
                    queryset = queryset.filter(status=completed_status)
                else:
                    queryset = queryset.exclude(status=completed_status)
        
        # Filter overdue tasks
        is_overdue = request.query_params.get('is_overdue')
        if is_overdue is not None:
            if is_overdue.lower() == 'true':
                queryset = queryset.filter(due_date__lt=timezone.now()).exclude(
                    status__name__iexact='completed'
                )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Tasks retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full task data
        task = Task.objects.get(pk=serializer.instance.pk)
        response_serializer = TaskSerializer(task, context={'request': request})
        return APIResponse.created(response_serializer.data, "Task created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Task retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full task data
        task = Task.objects.get(pk=serializer.instance.pk)
        response_serializer = TaskSerializer(task, context={'request': request})
        return APIResponse.success(response_serializer.data, "Task updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Task deleted successfully")
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete tasks"""
        task_ids = request.data.get('task_ids', [])
        
        if not task_ids:
            return APIResponse.error(
                "task_ids are required",
                ["Missing required field: task_ids"],
                status.HTTP_400_BAD_REQUEST
            )
        
        deleted_count = Task.objects.filter(
            id__in=task_ids,
            wedding=request.user.wedding
        ).delete()[0]
        
        return APIResponse.success({
            'deleted_count': deleted_count
        }, f"Deleted {deleted_count} tasks successfully")
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update tasks"""
        serializer = TaskBulkUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        task_ids = serializer.validated_data['task_ids']
        updates = serializer.validated_data['updates']
        
        tasks = Task.objects.filter(
            id__in=task_ids,
            wedding=request.user.wedding
        )
        
        updated_count = tasks.update(**updates)
        
        return APIResponse.success({
            'updated_count': updated_count
        }, f"Updated {updated_count} tasks successfully")
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get tasks grouped by status"""
        tasks = self.get_queryset()
        
        result = {}
        for status in TaskStatus.objects.all():
            status_tasks = tasks.filter(status=status)
            result[status.id] = {
                'name': status.name,
                'color': status.color,
                'count': status_tasks.count(),
                'tasks': TaskListSerializer(
                    status_tasks[:10],
                    many=True,
                    context={'request': request}
                ).data
            }
        
        return APIResponse.success(result, "Tasks by status retrieved successfully")
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get task statistics"""
        tasks = self.get_queryset()
        
        # Total stats
        total_count = tasks.count()
        
        # By status
        status_stats = {}
        for status in TaskStatus.objects.all():
            status_tasks = tasks.filter(status=status)
            status_stats[status.id] = {
                'name': status.name,
                'color': status.color,
                'count': status_tasks.count()
            }
        
        # By priority
        priority_stats = {}
        for priority in TaskPriority.objects.all():
            priority_tasks = tasks.filter(priority=priority)
            priority_stats[priority.id] = {
                'name': priority.name,
                'color': priority.color,
                'count': priority_tasks.count()
            }
        
        # Overdue tasks
        overdue_count = tasks.filter(
            due_date__lt=timezone.now()
        ).exclude(status__name__iexact='completed').count()
        
        # Due soon (next 7 days)
        due_soon_count = tasks.filter(
            due_date__lte=timezone.now() + timezone.timedelta(days=7),
            due_date__gte=timezone.now()
        ).exclude(status__name__iexact='completed').count()
        
        # Recent tasks (created in last 7 days)
        recent_count = tasks.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()
        
        return APIResponse.success({
            'total_count': total_count,
            'overdue_count': overdue_count,
            'due_soon_count': due_soon_count,
            'recent_count': recent_count,
            'by_status': status_stats,
            'by_priority': priority_stats
        }, "Task statistics retrieved successfully")
    
    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        """Mark task as complete"""
        task = self.get_object()
        completed_status = TaskStatus.objects.filter(name__iexact='completed').first()
        
        if not completed_status:
            return APIResponse.error(
                "Completed status not found",
                ["Task status 'completed' is not configured"],
                status.HTTP_400_BAD_REQUEST
            )
        
        task.status = completed_status
        task.progress = 100
        task.save()
        
        serializer = TaskSerializer(task, context={'request': request})
        return APIResponse.success(serializer.data, "Task marked as complete")
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a task"""
        original_task = self.get_object()
        
        # Create new task based on original
        new_task = Task.objects.create(
            wedding=original_task.wedding,
            title=f"{original_task.title} (Copy)",
            description=original_task.description,
            priority=original_task.priority,
            category=original_task.category,
            assigned_to=original_task.assigned_to,
            due_date=original_task.due_date,
            created_by=request.user
        )
        
        # Copy tags
        new_task.tags.set(original_task.tags.all())
        
        serializer = TaskSerializer(new_task, context={'request': request})
        return APIResponse.created(serializer.data, "Task duplicated successfully")


class TaskListCreateView(generics.ListCreateAPIView):
    """Task list and create endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'title', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Task.objects.filter(wedding=self.request.user.wedding).select_related(
            'status', 'priority', 'category', 'assigned_to', 'created_by'
        )
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TaskCreateSerializer
        return TaskListSerializer
    
    def perform_create(self, serializer):
        serializer.save(wedding=self.request.user.wedding, created_by=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filter by tags if provided
        tags = request.query_params.getlist('tags')
        if tags:
            queryset = queryset.filter(tags__name__in=tags).distinct()
        
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return APIResponse.success(serializer.data, "Tasks retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full task data
        task = Task.objects.get(pk=serializer.instance.pk)
        response_serializer = TaskSerializer(task, context={'request': request})
        return APIResponse.created(response_serializer.data, "Task created successfully")


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Task detail, update, and delete endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(wedding=self.request.user.wedding).select_related(
            'status', 'priority', 'category', 'assigned_to', 'created_by'
        ).prefetch_related('tags', 'depends_on', 'dependent_tasks')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TaskUpdateSerializer
        return TaskSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return APIResponse.success(serializer.data, "Task retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full task data
        task = Task.objects.get(pk=serializer.instance.pk)
        response_serializer = TaskSerializer(task, context={'request': request})
        return APIResponse.success(response_serializer.data, "Task updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Task deleted successfully")


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def task_statistics(request):
    """Get task statistics"""
    tasks = Task.objects.filter(wedding=request.user.wedding)
    
    # Total stats
    total_count = tasks.count()
    
    # By status
    status_stats = {}
    for status in TaskStatus.objects.all():
        status_tasks = tasks.filter(status=status)
        status_stats[status.id] = {
            'name': status.name,
            'color': status.color,
            'count': status_tasks.count()
        }
    
    # By priority
    priority_stats = {}
    for priority in TaskPriority.objects.all():
        priority_tasks = tasks.filter(priority=priority)
        priority_stats[priority.id] = {
            'name': priority.name,
            'color': priority.color,
            'count': priority_tasks.count()
        }
    
    # Overdue tasks
    overdue_count = tasks.filter(
        due_date__lt=timezone.now()
    ).exclude(status__name__iexact='completed').count()
    
    # Due soon (next 7 days)
    due_soon_count = tasks.filter(
        due_date__lte=timezone.now() + timezone.timedelta(days=7),
        due_date__gte=timezone.now()
    ).exclude(status__name__iexact='completed').count()
    
    return APIResponse.success({
        'total_count': total_count,
        'overdue_count': overdue_count,
        'due_soon_count': due_soon_count,
        'by_status': status_stats,
        'by_priority': priority_stats
    }, "Task statistics retrieved successfully")
