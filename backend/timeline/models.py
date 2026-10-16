from django.db import models


class TimelineStatus(models.Model):
    """Timeline event status model"""
    
    name = models.CharField(max_length=20, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'timeline_timeline_status'


class Timeline(models.Model):
    """Timeline model for wedding planning"""
    
    wedding = models.OneToOneField(
        'weddings.Wedding',
        on_delete=models.CASCADE,
        related_name='timeline'
    )
    name = models.CharField(max_length=200)
    
    def __str__(self):
        return f"{self.name} - {self.wedding.get_couple_name() or 'Wedding'}"
    
    class Meta:
        db_table = 'timeline_timeline'



def _default_timelinestatus():
    """Resolve the canonical 'pending' TimelineStatus, creating it if absent."""
    obj, _ = TimelineStatus.objects.get_or_create(name='pending')
    return obj.pk


class TimelineEvent(models.Model):
    """Timeline event model"""

    timeline = models.ForeignKey(
        Timeline,
        on_delete=models.CASCADE,
        related_name='events'
    )
    wedding = models.ForeignKey(
        'weddings.Wedding',
        on_delete=models.CASCADE,
        related_name='timeline_events',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(blank=True, null=True)
    type = models.CharField(
        max_length=20,
        choices=[
            ('meeting', 'Meeting'),
            ('payment', 'Payment'),
            ('deadline', 'Deadline'),
            ('event', 'Event'),
            ('task', 'Task'),
            ('reminder', 'Reminder')
        ],
        default='task'
    )
    status = models.ForeignKey(
        TimelineStatus,
        on_delete=models.PROTECT,
        default=_default_timelinestatus
    )
    priority = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High')
        ],
        default='medium'
    )
    location = models.CharField(max_length=200, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    # Link to the task this event came from, when it was generated from one.
    # Tasks and timeline events overlap heavily (title, description, date,
    # status), so the association avoids duplicating the same work item.
    task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='timeline_events'
    )

    # Legacy fields for backward compatibility
    event_date = models.DateField(editable=False, null=True, blank=True)
    start_time = models.TimeField(editable=False, null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Sync legacy fields for backward compatibility
        self.event_date = self.date
        if self.time:
            self.start_time = self.time
            if self.end_time is None:
                self.end_time = self.time
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.date}"

    class Meta:
        db_table = 'timeline_timeline_event'
        ordering = ['date', 'time']
        indexes = [
            # Timeline events are scoped by timeline and ordered or filtered
            # by date.
            models.Index(fields=['timeline', 'date']),
        ]
