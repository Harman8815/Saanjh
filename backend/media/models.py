from django.db import models


class MediaType(models.Model):
    """Media type model"""
    
    name = models.CharField(max_length=20, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'media_media_type'


class Album(models.Model):
    """Album model for organizing wedding media"""
    
    EVENT_CHOICES = [
        ('pre-wedding', 'Pre-Wedding'),
        ('wedding-day', 'Wedding Day'),
        ('post-wedding', 'Post-Wedding'),
        ('other', 'Other'),
    ]
    
    wedding = models.ForeignKey(
        'weddings.Wedding',
        on_delete=models.CASCADE,
        related_name='albums'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    event_type = models.CharField(
        max_length=20,
        choices=EVENT_CHOICES,
        default='other'
    )
    date = models.DateField(blank=True, null=True)
    cover_image = models.URLField(blank=True, null=True)
    featured = models.BooleanField(default=False)
    tags = models.ManyToManyField('AlbumTag', blank=True, related_name='albums')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.wedding.get_couple_name() or 'Wedding'}"
    
    def image_count(self):
        """Count images in album"""
        photo_type = MediaType.objects.filter(name='photo').first()
        if photo_type:
            return self.media_items.filter(media_type=photo_type).count()
        return self.media_items.filter(media__media_type__name='photo').count()
    
    def video_count(self):
        """Count videos in album"""
        video_type = MediaType.objects.filter(name='video').first()
        if video_type:
            return self.media_items.filter(media_type=video_type).count()
        return self.media_items.filter(media__media_type__name='video').count()
    
    class Meta:
        db_table = 'media_album'
        ordering = ['-date', '-created_at']
        indexes = [
            # Albums are scoped by wedding and sorted by date.
            models.Index(fields=['wedding', 'date']),
        ]


class MediaAlbum(models.Model):
    """Join model linking Media to Albums"""
    
    media = models.ForeignKey(
        'Media',
        on_delete=models.CASCADE,
        related_name='album_links'
    )
    album = models.ForeignKey(
        Album,
        on_delete=models.CASCADE,
        related_name='media_items'
    )
    added_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.media.title} in {self.album.title}"
    
    class Meta:
        db_table = 'media_media_album'
        unique_together = ['media', 'album']


class AlbumTag(models.Model):
    """Wedding-scoped tags shared across albums."""

    wedding = models.ForeignKey('weddings.Wedding', on_delete=models.CASCADE, related_name='album_tags')
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'media_album_tag'
        constraints = [models.UniqueConstraint(fields=['wedding', 'name'], name='unique_album_tag_per_wedding')]


class Media(models.Model):
    """Media model for wedding photos, videos, and documents"""
    
    wedding = models.ForeignKey(
        'weddings.Wedding',
        on_delete=models.CASCADE,
        related_name='media_files'
    )
    media_type = models.ForeignKey(
        MediaType,
        on_delete=models.PROTECT,
        related_name='media_files'
    )
    title = models.CharField(max_length=200)
    file_url = models.URLField(blank=True)
    thumbnail_url = models.URLField(blank=True, null=True)
    file = models.FileField(upload_to='media/%Y/%m/', blank=True, null=True)
    thumbnail = models.ImageField(upload_to='media/thumbnails/%Y/%m/', blank=True, null=True)
    file_size = models.BigIntegerField(blank=True, null=True)
    width = models.PositiveIntegerField(blank=True, null=True)
    height = models.PositiveIntegerField(blank=True, null=True)
    is_guest_submission = models.BooleanField(default=False)
    submitted_by_name = models.CharField(max_length=150, blank=True)
    submitted_by_email = models.EmailField(blank=True)
    submission_status = models.CharField(
        max_length=10,
        choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')],
        default='approved',
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.wedding.get_couple_name() or 'Wedding'}"
    
    class Meta:
        db_table = 'media_media'
        ordering = ['-uploaded_at']
        indexes = [
            # Media is scoped by wedding and listed newest first.
            models.Index(fields=['wedding', 'uploaded_at']),
        ]
