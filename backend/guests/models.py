from django.db import models
from django.conf import settings


class RsvpStatus(models.Model):
    """RSVP status model"""
    
    name = models.CharField(max_length=20, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'guests_rsvp_status'


class Table(models.Model):
    """Seating table model"""
    
    wedding = models.ForeignKey(
        'weddings.Wedding',
        on_delete=models.CASCADE,
        related_name='tables'
    )
    table_number = models.PositiveIntegerField()
    capacity = models.PositiveIntegerField()
    
    def __str__(self):
        return f"Table {self.table_number} (Capacity: {self.capacity})"
    
    class Meta:
        db_table = 'guests_table'
        unique_together = ['wedding', 'table_number']
        ordering = ['wedding', 'table_number']


class Meal(models.Model):
    """Meal options model"""
    
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'guests_meal'


class GuestMeal(models.Model):
    """Junction table for guest meal preferences"""
    
    guest = models.ForeignKey(
        'Guest',
        on_delete=models.CASCADE,
        related_name='meal_preferences'
    )
    meal = models.ForeignKey(
        Meal,
        on_delete=models.CASCADE,
        related_name='guest_assignments'
    )
    
    class Meta:
        db_table = 'guests_guest_meal'
        unique_together = ['guest', 'meal']


class Guest(models.Model):
    """Guest model for wedding invitation management"""
    
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
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # RSVP information
    rsvp_status = models.ForeignKey(
        RsvpStatus,
        on_delete=models.PROTECT,
        default=1  # Will be set to 'pending'
    )
    rsvp_date = models.DateField(blank=True, null=True)
    
    # Seating information
    table = models.ForeignKey(
        Table,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_guests'
    )
    
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
        return f"{self.full_name} - {self.wedding.get_couple_name() or 'Wedding'}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    class Meta:
        db_table = 'guests_guest'
        ordering = ['last_name', 'first_name']
