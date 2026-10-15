from django.db import models
from django.conf import settings


class WeddingStatus(models.Model):
    """Wedding status model"""
    
    name = models.CharField(max_length=20, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'weddings_wedding_status'


class VenueCatalog(models.Model):
    """Master venue catalog"""
    
    VENUE_TYPES = [
        ('hotel', 'Hotel'),
        ('restaurant', 'Restaurant'),
        ('outdoor', 'Outdoor Venue'),
        ('church', 'Church'),
        ('beach', 'Beach'),
        ('garden', 'Garden'),
        ('ballroom', 'Ballroom'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=VENUE_TYPES)
    address = models.TextField()
    capacity_min = models.PositiveIntegerField()
    capacity_max = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.FloatField(default=0.0)
    # Optional coordinates, used by the map search and radius filtering.
    # Null when an admin has not geocoded the address yet.
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} - {self.get_type_display()}"
    
    class Meta:
        db_table = 'weddings_venue_catalog'


class VenueAmenity(models.Model):
    """Venue amenities"""
    
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'weddings_venue_amenity'


class VenueAmenityMap(models.Model):
    """Junction table for venue amenities"""
    
    venue_catalog = models.ForeignKey(
        VenueCatalog,
        on_delete=models.CASCADE,
        related_name='amenity_mappings'
    )
    amenity = models.ForeignKey(
        VenueAmenity,
        on_delete=models.CASCADE,
        related_name='venue_mappings'
    )
    
    class Meta:
        db_table = 'weddings_venue_amenity_map'
        unique_together = ['venue_catalog', 'amenity']


class Venue(models.Model):
    """Wedding venue selection"""
    
    venue_catalog = models.ForeignKey(
        VenueCatalog,
        on_delete=models.PROTECT,
        related_name='wedding_venues'
    )
    
    def __str__(self):
        return f"Venue: {self.venue_catalog.name}"
    
    class Meta:
        db_table = 'weddings_venue'



def _default_weddingstatus():
    """Resolve the canonical 'planning' WeddingStatus, creating it if absent."""
    obj, _ = WeddingStatus.objects.get_or_create(name='planning')
    return obj.pk


class Wedding(models.Model):
    """Wedding model containing all wedding-related information"""
    
    # Couple information
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='wedding'
    )
    venue = models.ForeignKey(
        Venue,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='weddings'
    )
    # Direct link to the catalog entry. Venue adds no data of its own beyond
    # this FK, so keeping both means three hops for no information. This is the
    # canonical field; `venue` is still kept in sync for existing consumers.
    venue_catalog = models.ForeignKey(
        VenueCatalog,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='weddings_direct'
    )
    status = models.ForeignKey(
        WeddingStatus,
        on_delete=models.PROTECT,
        default=_default_weddingstatus
    )
    wedding_date = models.DateField(blank=True, null=True)
    theme = models.CharField(max_length=100, blank=True, null=True)
    # Venue catalog ids the couple shortlisted while browsing the catalog.
    saved_venues = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Wedding for {self.user.username}"

    def save(self, *args, **kwargs):
        # Keep the legacy three-level chain in step with the direct catalog
        # link, so existing consumers of `venue` keep working.
        if self.venue_catalog_id:
            if not self.venue_id or self.venue.venue_catalog_id != self.venue_catalog_id:
                self.venue, _ = Venue.objects.get_or_create(
                    venue_catalog_id=self.venue_catalog_id
                )
        elif self.venue_id and not self.venue_catalog_id:
            # Falls back to reading the chain the old way around.
            self.venue_catalog_id = self.venue.venue_catalog_id
        super().save(*args, **kwargs)

    def get_couple_name(self):
        """Get formatted couple name from user info"""
        if self.user.first_name and self.user.last_name:
            return f"{self.user.first_name} {self.user.last_name}"
        return self.user.username
    
    def days_until_wedding(self):
        """Calculate days until wedding"""
        if not self.wedding_date:
            return 0
        from django.utils import timezone
        today = timezone.now().date()
        diff = self.wedding_date - today
        return diff.days if diff.days > 0 else 0
    
    class Meta:
        db_table = 'weddings_wedding'
