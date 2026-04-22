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
    status = models.ForeignKey(
        WeddingStatus,
        on_delete=models.PROTECT,
        default=1  # Will be set to 'planning'
    )
    wedding_date = models.DateField(blank=True, null=True)
    theme = models.CharField(max_length=100, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Wedding for {self.user.username}"
    
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
