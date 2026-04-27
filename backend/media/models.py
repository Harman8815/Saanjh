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
    """Tags for albums"""
    
    album = models.ForeignKey(
        Album,
        on_delete=models.CASCADE,
        related_name='tags'
    )
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'media_album_tag'


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
    file_url = models.URLField()
    thumbnail_url = models.URLField(blank=True, null=True)
    file_size = models.BigIntegerField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.wedding.get_couple_name() or 'Wedding'}"
    
    class Meta:
        db_table = 'media_media'
        ordering = ['-uploaded_at']
