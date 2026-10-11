import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


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
    notifications = models.JSONField(default=dict, blank=True)
    privacy = models.JSONField(default=dict, blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    
    def __str__(self):
        return f"Settings for {self.user.username}"
    
    class Meta:
        db_table = 'accounts_settings'


class UserSession(models.Model):
    """
    Tracks active JWT sessions (devices) per user.

    Each row corresponds to one issued refresh token, identified by its ``jti``
    claim. Sessions enable server-side logout and a cap on concurrent devices.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sessions'
    )

    # jti claim of the refresh token backing this session.
    refresh_jti = models.CharField(max_length=255, unique=True)

    # Device / client descriptors captured at login.
    device_name = models.CharField(max_length=255, blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')

    # Lifecycle
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(auto_now=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'accounts_user_session'
        ordering = ['-created_at']

    def __str__(self):
        return f"Session for {self.user.username} ({self.device_name or 'unknown device'})"

    def revoke(self, blacklist_token=True):
        """Mark this session inactive and blacklist its refresh token."""
        if blacklist_token and self.refresh_jti:
            self._blacklist_refresh_token()
        self.is_active = False
        self.revoked_at = timezone.now()
        self.save(update_fields=['is_active', 'revoked_at', 'last_used_at'])

    def _blacklist_refresh_token(self):
        """
        Blacklist the refresh token identified by this session's jti.

        SimpleJWT creates OutstandingToken rows lazily, so for a token that has
        never been rotated we synthesize one carrying the same jti, user and
        expiry claims before registering it in the blacklist.
        """
        from rest_framework_simplejwt.settings import api_settings
        from rest_framework_simplejwt.token_blacklist.models import (
            BlacklistedToken,
            OutstandingToken,
        )
        from rest_framework_simplejwt.tokens import RefreshToken

        if BlacklistedToken.objects.filter(token__jti=self.refresh_jti).exists():
            return False

        # A token that was already rotated has an OutstandingToken record.
        outstanding = OutstandingToken.objects.filter(jti=self.refresh_jti).first()
        if outstanding is not None:
            _, created = BlacklistedToken.objects.get_or_create(token=outstanding)
            return created

        # Otherwise build an equivalent token so SimpleJWT can register it.
        token = RefreshToken()
        token['jti'] = self.refresh_jti
        token[api_settings.USER_ID_CLAIM] = self.user_id
        token['exp'] = int(timezone.now().timestamp()) + int(
            api_settings.REFRESH_TOKEN_LIFETIME.total_seconds()
        )
        try:
            token.blacklist()
            return True
        except Exception:
            return False