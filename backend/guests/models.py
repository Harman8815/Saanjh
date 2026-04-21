from django.db import models
from django.conf import settings

class Guest(models.Model):
    """Guest model for wedding invitation management"""
    
    RSVP_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('declined', 'Declined'),
    ]
    
    RELATIONSHIP_CHOICES = [
        ('family', 'Family'),
        ('friend', 'Friend'),
        ('colleague', 'Colleague'),
        ('other', 'Other'),
    ]
    
    # Guest information
    wedding = models.ForeignKey(
        'weddings.Wedding', 
        on_delete=models.CASCADE, 
        related_name='guests'
    )
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # RSVP information
    rsvp_status = models.CharField(max_length=20, choices=RSVP_STATUS_CHOICES, default='pending')
    rsvp_date = models.DateField(blank=True, null=True)
    plus_one = models.BooleanField(default=False)
    plus_one_name = models.CharField(max_length=100, blank=True, null=True)
    
    # Guest details
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, default='friend')
    address = models.TextField(blank=True, null=True)
    dietary_restrictions = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Invitation tracking
    invitation_sent = models.BooleanField(default=False)
    invitation_sent_date = models.DateTimeField(blank=True, null=True)
    reminder_sent = models.BooleanField(default=False)
    reminder_sent_date = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    added_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.wedding.get_couple_name() or 'Wedding'}"
    
    class Meta:
        db_table = 'guests_guest'
        ordering = ['name']
