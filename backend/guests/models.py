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


class GuestGroup(models.Model):
    """Grouping for guests: families, households, friends, colleagues."""
    
    SIDE_CHOICES = [
        ('bride', 'Bride'),
        ('groom', 'Groom'),
        ('both', 'Both'),
    ]
    
    GROUP_TYPE_CHOICES = [
        ('family', 'Family'),
        ('friend', 'Friend'),
        ('colleague', 'Colleague'),
        ('household', 'Household'),
    ]
    
    wedding = models.ForeignKey(
        'weddings.Wedding',
        on_delete=models.CASCADE,
        related_name='guest_groups'
    )
    name = models.CharField(max_length=100)
    side = models.CharField(max_length=10, choices=SIDE_CHOICES, default='both')
    group_type = models.CharField(
        max_length=10, choices=GROUP_TYPE_CHOICES, default='family'
    )
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_group_type_display()})"
    
    class Meta:
        db_table = 'guests_guest_group'
        unique_together = ['wedding', 'name']
        ordering = ['name']


class DietaryOption(models.Model):
    """Global dietary option (Vegetarian, Vegan, Gluten-Free, ...)."""
    
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'guests_dietary_option'
        ordering = ['name']


class GuestDietary(models.Model):
    """Junction table for structured guest dietary preferences."""
    
    guest = models.ForeignKey(
        'Guest',
        on_delete=models.CASCADE,
        related_name='dietary_preferences'
    )
    option = models.ForeignKey(
        DietaryOption,
        on_delete=models.CASCADE,
        related_name='guest_assignments'
    )
    
    class Meta:
        db_table = 'guests_guest_dietary'
        unique_together = ['guest', 'option']


def _default_rsvp_status():
    """Resolve the canonical 'pending' RSVP status, creating it if absent."""
    obj, _ = RsvpStatus.objects.get_or_create(name='pending')
    return obj.pk


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
        default=_default_rsvp_status
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

    # Grouping and plus-one handling
    group = models.ForeignKey(
        GuestGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='guests'
    )
    plus_one_name = models.CharField(max_length=200, blank=True, null=True)
    plus_one_rsvp_status = models.ForeignKey(
        RsvpStatus,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='plus_one_guests'
    )
    is_plus_one_of = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='plus_ones'
    )
    
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
        indexes = [
            # Guest lists are always fetched by wedding, then filtered or
            # sorted by RSVP status.
            models.Index(fields=['wedding', 'rsvp_status']),
        ]
