from rest_framework import generics, permissions, serializers, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Q, Prefetch
from django.utils import timezone
from django.http import HttpResponse
from datetime import date, datetime, time, timedelta, timezone as datetime_timezone
import calendar

from .models import (
    Task, TaskStatus, TaskPriority, TaskCategory, TaskComment, TaskOccurrence,
    TaskTemplate,
)
from .serializers import (
    TaskSerializer, TaskListSerializer, TaskCreateSerializer, TaskUpdateSerializer,
    TaskStatusSerializer, TaskPrioritySerializer, TaskCategorySerializer,
    TaskBulkUpdateSerializer, TaskCommentSerializer, TaskOccurrenceSerializer,
    TaskTemplateSerializer,
)
from utils.api_response import APIResponse
from accounts.permissions import IsAdminOrReadOnly


# Fields a bulk update may touch, and how to interpret the incoming value.
# Anything outside this list is ignored so a stray key cannot wedge the ORM.
BULK_UPDATE_FIELDS = {
    'status': 'fk',
    'priority': 'fk',
    'category': 'fk',
    'assigned_to': 'fk',
    'title': 'str',
    'description': 'str',
    'due_date': 'plain',
    'progress': 'plain',
    'depends_on': 'm2m',
}


def _resolve_bulk_updates(model, updates, wedding_id=None):
    """
    Normalise a bulk update payload into values safe to assign on instances.

    Foreign keys arrive as ids and must be converted to model instances before
    ``setattr``; unknown fields are dropped.
    """
    resolved = {}
    for field, kind in BULK_UPDATE_FIELDS.items():
        if field not in updates:
            continue

        value = updates[field]
        if kind == 'fk':
            if value is None:
                resolved[field] = None
                continue
            model_field = model._meta.get_field(field)
            related = model_field.related_model.objects.filter(pk=value).first()
            if related is None:
                # Silently skip invalid ids rather than failing the batch.
                continue
            resolved[field] = related
        elif kind == 'm2m':
            model_field = model._meta.get_field(field)
            related_model = model_field.related_model
            related = related_model.objects.filter(pk__in=value)
            if wedding_id is not None and hasattr(related_model, 'wedding_id'):
                related = related.filter(wedding_id=wedding_id)
            if related.count() != len(set(value)):
                raise serializers.ValidationError({field: 'Every dependency must belong to this wedding.'})
            resolved[field] = list(related)
        else:
            resolved[field] = value
    return resolved


def _dependency_reaches(task, target_id):
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


def _add_months(value, months):
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)


def _next_due_date(task, current_date):
    interval = max(task.recurrence_interval, 1)
    if task.recurrence == 'daily':
        next_date = current_date + timedelta(days=interval)
    elif task.recurrence == 'weekly':
        next_date = current_date + timedelta(weeks=interval)
    elif task.recurrence == 'monthly':
        next_date = _add_months(current_date, interval)
    else:
        return None
    if task.recurrence_ends_on and next_date.date() > task.recurrence_ends_on:
        return None
    return next_date


def _ical_escape(value):
    return str(value or '').replace('\\', '\\\\').replace(';', '\\;').replace(',', '\\,').replace('\n', '\\n')


def _ical_response(events, filename='tasks.ics'):
    lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Planner//Tasks//EN', 'CALSCALE:GREGORIAN']
    for event in events:
        lines.extend([
            'BEGIN:VEVENT',
            f"UID:{event['uid']}",
            f"DTSTAMP:{timezone.now().strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART:{event['start']}",
            f"SUMMARY:{_ical_escape(event['title'])}",
        ])
        if event.get('description'):
            lines.append(f"DESCRIPTION:{_ical_escape(event['description'])}")
        lines.append('END:VEVENT')
    lines.append('END:VCALENDAR')
    response = HttpResponse('\r\n'.join(lines) + '\r\n', content_type='text/calendar; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


class TaskStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for TaskStatus model"""
    queryset = TaskStatus.objects.all()
    serializer_class = TaskStatusSerializer
    permission_classes = [IsAdminOrReadOnly]
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
    permission_classes = [IsAdminOrReadOnly]
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
    permission_classes = [IsAdminOrReadOnly]
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

        resolved_updates = _resolve_bulk_updates(
            Task, updates, wedding_id=request.user.wedding_id
        )
        if 'depends_on' in resolved_updates:
            for task in tasks:
                if any(dependency.pk == task.pk or _dependency_reaches(dependency, task.pk)
                       for dependency in resolved_updates['depends_on']):
                    raise serializers.ValidationError({
                        'depends_on': 'This update would create a dependency cycle.'
                    })

        # Iterate rather than queryset.update() so Task.save() runs: that is
        # what keeps completed_at and progress consistent with the status
        # (a bulk update would otherwise skip both the setting and clearing).
        updated_count = 0
        for task in tasks:
            for field, value in resolved_updates.items():
                if field == 'depends_on':
                    task.depends_on.set(value)
                    continue
                setattr(task, field, value)
            task.save()
            updated_count += 1

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
    def board(self, request):
        categories = TaskCategory.objects.all().order_by('name')
        category_id = request.query_params.get('category')
        if not category_id:
            return APIResponse.success({
                'categories': TaskCategorySerializer(categories, many=True).data,
                'selected_category': None,
                'columns': [],
            }, 'Task board categories retrieved successfully')
        try:
            category = categories.get(pk=category_id)
        except (TaskCategory.DoesNotExist, ValueError):
            return APIResponse.error(
                'Task category not found', ['Select a valid task category'],
                status.HTTP_404_NOT_FOUND,
            )

        board_tasks = self.get_queryset().filter(category=category)
        columns = []
        for task_status in TaskStatus.objects.all():
            column_tasks = board_tasks.filter(status=task_status)
            columns.append({
                'task_status': TaskStatusSerializer(task_status).data,
                'count': column_tasks.count(),
                'tasks': TaskListSerializer(
                    column_tasks, many=True, context={'request': request}
                ).data,
            })
        return APIResponse.success({
            'categories': TaskCategorySerializer(categories, many=True).data,
            'selected_category': TaskCategorySerializer(category).data,
            'columns': columns,
        }, 'Task board retrieved successfully')

    @action(detail=False, methods=['get'])
    def templates(self, request):
        templates = TaskTemplate.objects.filter(is_active=True).prefetch_related('items')
        return APIResponse.success(
            TaskTemplateSerializer(templates, many=True).data,
            'Task templates retrieved successfully',
        )

    @action(detail=False, methods=['post'], url_path='from-template')
    def from_template(self, request):
        template_id = request.data.get('template_id')
        template = TaskTemplate.objects.filter(is_active=True, pk=template_id).prefetch_related('items').first()
        if not template:
            return APIResponse.error('Task template not found', ['Select an active template'], status.HTTP_404_NOT_FOUND)
        anchor_value = request.data.get('anchor_date')
        try:
            anchor = date.fromisoformat(anchor_value) if anchor_value else request.user.wedding.wedding_date
        except (TypeError, ValueError):
            return APIResponse.error('Invalid anchor date', ['Use YYYY-MM-DD'], status.HTTP_400_BAD_REQUEST)
        if not anchor:
            return APIResponse.error('Anchor date required', ['Provide anchor_date when the wedding date is not set'], status.HTTP_400_BAD_REQUEST)

        status_value = TaskStatus.objects.filter(name__iexact='todo').first() or TaskStatus.objects.first()
        priority_value = TaskPriority.objects.first()
        if not status_value or not priority_value:
            return APIResponse.error('Task defaults are not configured', ['Create task statuses and priorities first'], status.HTTP_400_BAD_REQUEST)

        created = []
        for item in template.items.all():
            due = anchor + timedelta(days=item.offset_days)
            created.append(Task.objects.create(
                wedding=request.user.wedding,
                title=item.title,
                description=item.description,
                due_date=timezone.make_aware(datetime.combine(due, time.min)),
                status=status_value,
                priority=item.priority or priority_value,
                category=item.category,
                created_by=request.user,
            ))
        return APIResponse.created(
            TaskListSerializer(created, many=True, context={'request': request}).data,
            f'Created {len(created)} tasks from template',
        )

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        task = self.get_object()
        if request.method == 'GET':
            return APIResponse.success(
                TaskCommentSerializer(task.comments.select_related('author'), many=True).data,
                'Task comments retrieved successfully',
            )
        serializer = TaskCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(task=task, author=request.user)
        return APIResponse.created(TaskCommentSerializer(comment).data, 'Task comment created successfully')

    @action(detail=True, methods=['get'])
    def dependencies(self, request, pk=None):
        task = self.get_object()
        chain = []
        pending = list(task.depends_on.all())
        visited = set()
        due_dates = []
        while pending:
            dependency = pending.pop(0)
            if dependency.pk in visited:
                continue
            visited.add(dependency.pk)
            chain.append(dependency)
            if dependency.due_date:
                due_dates.append(dependency.due_date)
            pending.extend(dependency.depends_on.all())
        earliest = max(due_dates) if due_dates else timezone.now()
        return APIResponse.success({
            'task_id': task.pk,
            'dependencies': TaskListSerializer(chain, many=True, context={'request': request}).data,
            'earliest_feasible_start': earliest,
        }, 'Task dependencies retrieved successfully')

    def _record_occurrence(self, request, task, outcome):
        if task.recurrence == 'none':
            return APIResponse.error('Task is not recurring', ['Set a recurrence before recording an occurrence'], status.HTTP_400_BAD_REQUEST)
        current = task.due_date or timezone.now()
        scheduled_for = timezone.localtime(current).date() if timezone.is_aware(current) else current.date()
        occurrence, created = TaskOccurrence.objects.get_or_create(
            task=task,
            scheduled_for=scheduled_for,
            defaults={'outcome': outcome},
        )
        if not created:
            return APIResponse.error('Occurrence already recorded', ['This date already has an outcome'], status.HTTP_409_CONFLICT)
        task.due_date = _next_due_date(task, current)
        task.save(update_fields=['due_date', 'updated_at'])
        return APIResponse.success({
            'occurrence': TaskOccurrenceSerializer(occurrence).data,
            'next_due_date': task.due_date,
        }, 'Recurring task occurrence recorded successfully')

    @action(detail=True, methods=['post'], url_path='recurrence/skip')
    def skip_occurrence(self, request, pk=None):
        return self._record_occurrence(request, self.get_object(), 'skipped')

    @action(detail=True, methods=['post'], url_path='complete-occurrence')
    def complete_occurrence(self, request, pk=None):
        return self._record_occurrence(request, self.get_object(), 'completed')

    @action(detail=False, methods=['get'], url_path='export/ical')
    def export_ical(self, request):
        events = []
        for task in self.get_queryset().filter(due_date__isnull=False).select_related('status'):
            due = task.due_date
            if timezone.is_aware(due):
                start = due.astimezone(datetime_timezone.utc).strftime('%Y%m%dT%H%M%SZ')
            else:
                start = due.strftime('%Y%m%dT%H%M%S')
            events.append({
                'uid': f'task-{task.pk}@wedding-planner',
                'start': start,
                'title': task.title,
                'description': task.description,
            })
        if request.query_params.get('include_timeline') == 'true':
            from timeline.models import TimelineEvent
            for event in TimelineEvent.objects.filter(wedding=request.user.wedding, date__isnull=False):
                event_start = event.date.strftime('%Y%m%d')
                if event.time:
                    event_start += f'T{event.time.strftime("%H%M%S")}'
                else:
                    event_start = f';VALUE=DATE:{event_start}'
                events.append({
                    'uid': f'timeline-{event.pk}@wedding-planner',
                    'start': event_start,
                    'title': event.title,
                    'description': event.description,
                })
        return _ical_response(events)
    
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
