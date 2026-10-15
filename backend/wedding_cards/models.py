from django.core.exceptions import ValidationError
from django.db import models
from django.conf import settings
from django.utils import timezone


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

    # Origin of the RSVP: a linked guest from the main list, or someone who
    # arrived through the public shareable link.
    GUEST_SOURCE_CHOICES = [
        ('main_list', 'Main guest list'),
        ('external', 'External (public link)'),
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

    # Where this RSVP came from: the main guest list or a direct external link.
    # A null guest is only meaningful for 'external'; keeping the source
    # explicit avoids guessing from a nullable FK.
    source = models.CharField(
        max_length=20,
        choices=GUEST_SOURCE_CHOICES,
        default='external'
    )

    # Guest information for external guests (not in the main guest list).
    # For linked guests these columns are mirrored from Guest in save() and
    # the API serves the derived values instead, so Guest stays the source
    # of truth and the columns can never disagree with it.
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True, null=True)

    # RSVP information
    rsvp_status = models.CharField(
        max_length=20,
        choices=RSVP_STATUS_CHOICES,
        default='pending',
        db_index=True
    )
    # Set when the guest first RSVPs; refreshed only when they change their
    # answer, not on unrelated edits.
    rsvp_date = models.DateTimeField(null=True, blank=True)
    plus_one = models.BooleanField(default=False)
    plus_one_name = models.CharField(max_length=100, blank=True, null=True)
    
    # Dietary restrictions and notes. Dietary restrictions fall back to the
    # linked guest so it is only stored here for external RSVPs.
    dietary_restrictions = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Guest uploaded photos
    uploaded_photos = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.display_name} - {self.wedding_card.couple_names}"

    # Derived identity: the main guest list owns it when the RSVP is linked.
    @property
    def display_name(self):
        if self.guest_id and self.guest:
            return self.guest.full_name
        return self.name or ''

    @property
    def display_email(self):
        if self.guest_id and self.guest:
            return self.guest.email or self.email
        return self.email

    @property
    def display_dietary_restrictions(self):
        if self.guest_id and self.guest:
            return self.guest.dietary_restrictions
        return self.dietary_restrictions

    def save(self, *args, **kwargs):
        # Keep the source in step with the guest link: a linked guest is
        # always from the main list, an unlinked one from the public link.
        if self.guest_id:
            self.source = 'main_list'
            # Mirror the guest list record so the two cannot drift.
            if self.guest:
                self.name = self.guest.full_name
                self.email = self.guest.email
                self.dietary_restrictions = self.guest.dietary_restrictions
        else:
            self.source = 'external'
            # An external RSVP must be identifiable.
            if not (self.name or '').strip():
                raise ValidationError(
                    {'name': 'A name is required for guests outside the main list.'}
                )

        # Record the RSVP answer time only when the answer actually changes,
        # so editing notes or dietary details does not fabricate a new RSVP.
        if self._state.adding:
            if self.rsvp_status != 'pending':
                self.rsvp_date = timezone.now()
        else:
            previous = WeddingCardGuest.objects.filter(pk=self.pk).first()
            if previous is not None and previous.rsvp_status != self.rsvp_status:
                self.rsvp_date = timezone.now()

        # Callers may pass update_fields; make sure the columns we just wrote
        # are included, otherwise they would be silently skipped.
        update_fields = kwargs.get('update_fields')
        if update_fields is not None:
            kwargs['update_fields'] = set(update_fields) | {
                'source', 'rsvp_date', 'name', 'email', 'dietary_restrictions'
            }

        super().save(*args, **kwargs)

    class Meta:
        ordering = ['name']
        indexes = [
            # RSVPs are listed per card and filtered by status.
            models.Index(fields=['wedding_card', 'rsvp_status']),
        ]

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
