from django.db import models
from django.conf import settings


class TaskStatus(models.Model):
    """Task status model"""
    
    name = models.CharField(max_length=20, unique=True)
    color = models.CharField(max_length=7, default='#6c757d')  # Hex color code
    order = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'tasks_task_status'
        ordering = ['order', 'name']


class TaskPriority(models.Model):
    """Task priority model"""
    
    name = models.CharField(max_length=20, unique=True)
    color = models.CharField(max_length=7, default='#6c757d')  # Hex color code
    order = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'tasks_task_priority'
        ordering = ['order', 'name']


class TaskCategory(models.Model):
    """Task category model"""
    
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=7, default='#6c757d')  # Hex color code
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'tasks_task_category'
        verbose_name_plural = 'Task Categories'



def _default_taskstatus():
    """Resolve the canonical 'todo' TaskStatus, creating it if absent."""
    obj, _ = TaskStatus.objects.get_or_create(name='todo')
    return obj.pk


class Task(models.Model):
    """Task model for wedding planning tasks"""
    
    RECURRENCE_CHOICES = [
        ('none', 'None'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    wedding = models.ForeignKey(
        'weddings.Wedding',
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    
    # Subtask parent (self-FK; top-level tasks have parent=None)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subtasks'
    )
    
    # Task classification
    status = models.ForeignKey(
        TaskStatus,
        on_delete=models.PROTECT,
        default=_default_taskstatus
    )
    priority = models.ForeignKey(
        TaskPriority,
        on_delete=models.PROTECT,
        default=2  # Will be set to 'medium'
    )
    category = models.ForeignKey(
        TaskCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )
    
    # Basic information
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Assignment
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    
    # Date information
    due_date = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Progress tracking
    progress = models.PositiveIntegerField(default=0, help_text="Progress percentage (0-100)")
    
    # Dependencies
    depends_on = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        related_name='dependent_tasks'
    )
    
    # Tags
    tags = models.ManyToManyField('documents.DocumentTag', blank=True, related_name='tasks')
    
    # Recurrence
    recurrence = models.CharField(max_length=10, choices=RECURRENCE_CHOICES, default='none')
    recurrence_interval = models.PositiveIntegerField(
        default=1,
        help_text="Every N days/weeks/months"
    )
    recurrence_ends_on = models.DateField(null=True, blank=True)
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.wedding.get_couple_name() or 'Wedding'}"
    
    def save(self, *args, **kwargs):
        # Auto-set completed_at when status changes to completed
        if self.status and self.status.name.lower() == 'completed' and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()
            self.progress = 100
        elif self.status and self.status.name.lower() != 'completed' and self.completed_at:
            self.completed_at = None
        
        super().save(*args, **kwargs)
    
    def is_overdue(self):
        """Check if task is overdue"""
        if self.status and self.status.name.lower() == 'completed':
            return False
        if not self.due_date:
            return False
        from django.utils import timezone
        return timezone.now() > self.due_date
    
    def days_until_due(self):
        """Calculate days until due date"""
        if not self.due_date:
            return None
        from django.utils import timezone
        now = timezone.now()
        diff = self.due_date - now
        return diff.days
    
    def can_start(self):
        """Check if task can start (all dependencies completed)"""
        if not self.depends_on.exists():
            return True
        
        completed_status = TaskStatus.objects.filter(name__iexact='completed').first()
        if not completed_status:
            return True
        
        return self.depends_on.filter(status=completed_status).count() == self.depends_on.count()
    
    def has_cycle(self, visited=None):
        """Detect dependency cycles (DFS). Returns True if adding self creates a cycle."""
        if visited is None:
            visited = set()
        if self.pk in visited:
            return True
        visited.add(self.pk)
        for dep in self.depends_on.all():
            if dep.has_cycle(set(visited)):
                return True
        return False
    
    class Meta:
        db_table = 'tasks_task'
        ordering = ['-created_at']
        indexes = [
            # Tasks are always scoped by wedding, then filtered by status.
            models.Index(fields=['wedding', 'status']),
            # Overdue and "due soon" queries sort by due date within a wedding.
            models.Index(fields=['wedding', 'due_date']),
        ]


class TaskComment(models.Model):
    """Comment thread on a task"""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='task_comments'
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.author} on '{self.task.title}'"

    class Meta:
        db_table = 'tasks_task_comment'
        ordering = ['created_at']


class TaskTemplate(models.Model):
    """Reusable task template (e.g. 'Standard Wedding Checklist')"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'tasks_task_template'
        ordering = ['name']


class TaskTemplateItem(models.Model):
    """A single task item within a TaskTemplate"""
    template = models.ForeignKey(TaskTemplate, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    offset_days = models.IntegerField(
        default=0,
        help_text="Days relative to wedding date (negative = before, positive = after)"
    )
    priority = models.ForeignKey(
        TaskPriority,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    category = models.ForeignKey(
        TaskCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.template.name}: {self.title}"

    class Meta:
        db_table = 'tasks_task_template_item'
        ordering = ['offset_days', 'id']


class TaskOccurrence(models.Model):
    OUTCOME_CHOICES = [
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    ]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='occurrences')
    scheduled_for = models.DateField()
    outcome = models.CharField(max_length=10, choices=OUTCOME_CHOICES)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tasks_task_occurrence'
        ordering = ['-scheduled_for', '-recorded_at']
        constraints = [
            models.UniqueConstraint(
                fields=['task', 'scheduled_for'],
                name='unique_task_occurrence_date',
            ),
        ]

