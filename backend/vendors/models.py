from django.db import models

class Vendor(models.Model):
    """Vendor model for wedding service providers"""
    
    VENDOR_TYPES = [
        ('venue', 'Venue'),
        ('photography', 'Photography'),
        ('catering', 'Catering'),
        ('florist', 'Florist'),
        ('music', 'Music/Entertainment'),
        ('cake', 'Cake'),
        ('decorations', 'Decorations'),
        ('transportation', 'Transportation'),
        ('officiant', 'Officiant'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('contacted', 'Contacted'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic information
    wedding = models.ForeignKey(
        'weddings.Wedding', 
        on_delete=models.CASCADE, 
        related_name='vendors'
    )
    name = models.CharField(max_length=200)
    vendor_type = models.CharField(max_length=20, choices=VENDOR_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Contact information
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Booking details
    cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    deposit_paid = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    booking_date = models.DateField(blank=True, null=True)
    contract_signed = models.BooleanField(default=False)
    contract_signed_date = models.DateField(blank=True, null=True)
    
    # Service details
    services_provided = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Communication tracking
    last_contact_date = models.DateTimeField(blank=True, null=True)
    next_follow_up = models.DateField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.get_vendor_type_display()} ({self.wedding.get_couple_name() or 'Wedding'})"
    
    class Meta:
        db_table = 'vendors_vendor'
        ordering = ['vendor_type', 'name']
