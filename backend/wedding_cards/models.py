from django.db import models
from django.conf import settings

class WeddingCard(models.Model):
    """Wedding card model for digital wedding invitations"""
    
    TEMPLATES = [
        (1, 'Elegant Classic'),
        (2, 'Modern Minimal'),
        (3, 'Romantic Floral'),
        (4, 'Vintage Charm'),
        (5, 'Beach Theme'),
        (6, 'Rustic Country'),
    ]
    
    FONT_STYLES = [
        ('elegant', 'Elegant'),
        ('modern', 'Modern'),
        ('playful', 'Playful'),
        ('vintage', 'Vintage'),
        ('minimal', 'Minimal'),
    ]
    
    # Basic information
    wedding = models.ForeignKey(
        'weddings.Wedding', 
        on_delete=models.CASCADE, 
        related_name='wedding_cards'
    )
    template = models.IntegerField(choices=TEMPLATES, default=1)
    
    # Card content
    couple_names = models.CharField(max_length=200)
    wedding_details = models.TextField()
    
    # Design settings
    primary_color = models.CharField(max_length=7, default='#8B5CF6')  # Hex color
    font_style = models.CharField(max_length=20, choices=FONT_STYLES, default='elegant')
    
    # Photos
    photos = models.JSONField(default=list, blank=True)  # Store photo URLs as JSON array
    
    # Settings
    allow_guest_photos = models.BooleanField(default=True)
    require_rsvp = models.BooleanField(default=True)
    send_reminders = models.BooleanField(default=True)
    
    # Shareable link
    shareable_link = models.SlugField(unique=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Wedding Card: {self.couple_names} - Template {self.template}"
    
    def save(self, *args, **kwargs):
        if not self.shareable_link:
            import uuid
            self.shareable_link = str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)

class WeddingCardGuest(models.Model):
    """Guest RSVP for wedding cards"""
    
    RSVP_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('declined', 'Declined'),
    ]
    
    # Relations
    wedding_card = models.ForeignKey(
        WeddingCard, 
        on_delete=models.CASCADE, 
        related_name='card_guests'
    )
    guest = models.ForeignKey(
        'guests.Guest', 
        on_delete=models.CASCADE, 
        blank=True, 
        null=True,
        related_name='card_rsvps'
    )
    
    # Guest information (for external guests not in main guest list)
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    
    # RSVP information
    rsvp_status = models.CharField(max_length=20, choices=RSVP_STATUS_CHOICES, default='pending')
    rsvp_date = models.DateTimeField(auto_now=True)
    plus_one = models.BooleanField(default=False)
    plus_one_name = models.CharField(max_length=100, blank=True, null=True)
    
    # Dietary restrictions and notes
    dietary_restrictions = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Guest uploaded photos
    uploaded_photos = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"{self.name} - {self.wedding_card.couple_names}"

class WeddingCardAnalytics(models.Model):
    """Analytics for wedding cards"""
    
    wedding_card = models.OneToOneField(
        WeddingCard, 
        on_delete=models.CASCADE, 
        related_name='analytics'
    )
    
    # View statistics
    total_views = models.PositiveIntegerField(default=0)
    unique_views = models.PositiveIntegerField(default=0)
    
    # RSVP statistics
    total_rsvps = models.PositiveIntegerField(default=0)
    confirmed_rsvps = models.PositiveIntegerField(default=0)
    declined_rsvps = models.PositiveIntegerField(default=0)
    
    # Photo statistics
    total_photos_uploaded = models.PositiveIntegerField(default=0)
    
    # Last updated
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics: {self.wedding_card.couple_names}"
    
    def get_rsvp_rate(self):
        """Calculate RSVP rate as percentage"""
        if self.total_rsvps == 0:
            return 0
        return round((self.confirmed_rsvps / self.total_rsvps) * 100, 2)
