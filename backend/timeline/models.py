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


class TimelineEvent(models.Model):
    """Timeline event model"""
    
    timeline = models.ForeignKey(
        Timeline,
        on_delete=models.CASCADE,
        related_name='events'
    )
    title = models.CharField(max_length=200)
    event_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.ForeignKey(
        TimelineStatus,
        on_delete=models.PROTECT,
        default=1  # Will be set to 'pending'
    )
    
    def __str__(self):
        return f"{self.title} - {self.event_date}"
    
    class Meta:
        db_table = 'timeline_timeline_event'
        ordering = ['event_date', 'start_time']
