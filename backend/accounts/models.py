from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.Model):
    """Role model for user roles in the wedding system"""
    
    ROLE_CHOICES = [
        ('bride', 'Bride'),
        ('groom', 'Groom'),
        ('guardian', 'Guardian'),
        ('admin', 'Admin'),
    ]
    
    name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)
    
    def __str__(self):
        return self.get_name_display()
    
    class Meta:
        db_table = 'accounts_role'


class User(AbstractUser):
    """Custom user model for wedding planning application"""
    
    # Profile information
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Role relationship
    role = models.ForeignKey(
        Role, 
        on_delete=models.PROTECT,  # Don't allow deletion of roles if they're in use
        related_name='users',
        null=True,
        blank=True
    )
    
    # Account status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}" if self.first_name else self.username
    
    class Meta:
        db_table = 'accounts_user'


class Settings(models.Model):
    """User settings and preferences"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='settings'
    )
    
    # Display preferences
    theme = models.CharField(max_length=20, default='light')
    language = models.CharField(max_length=10, default='en')
    currency = models.CharField(max_length=3, default='USD')
    timezone = models.CharField(max_length=50, default='UTC')
    
    def __str__(self):
        return f"Settings for {self.user.username}"
    
    class Meta:
        db_table = 'accounts_settings'
