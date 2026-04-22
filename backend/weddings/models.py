from django.db import models
from django.conf import settings

class Wedding(models.Model):
    """Wedding model containing all wedding-related information"""
    
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Couple information
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='wedding'
    )
    bride_name = models.CharField(max_length=100, blank=True, null=True)
    groom_name = models.CharField(max_length=100, blank=True, null=True)
    partner_name = models.CharField(max_length=100, blank=True, null=True)  # For same-sex couples
    
    # Wedding details
    wedding_date = models.DateField(blank=True, null=True)
    venue = models.CharField(max_length=255, blank=True, null=True)
    venue_address = models.TextField(blank=True, null=True)
    guest_count = models.PositiveIntegerField(default=0)
    budget = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Wedding website
    website_url = models.URLField(blank=True, null=True)
    website_domain = models.CharField(max_length=100, blank=True, null=True)
    
    # Status and timeline
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        couple_name = self.get_couple_name()
        return f"Wedding: {couple_name}" if couple_name else f"Wedding for {self.user.username}"
    
    def get_couple_name(self):
        """Get formatted couple name"""
        if self.bride_name and self.groom_name:
            return f"{self.bride_name} & {self.groom_name}"
        elif self.partner_name and self.bride_name:
            return f"{self.bride_name} & {self.partner_name}"
        elif self.partner_name and self.groom_name:
            return f"{self.groom_name} & {self.partner_name}"
        return None
    
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
