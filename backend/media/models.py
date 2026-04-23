from django.db import models


class MediaType(models.Model):
    """Media type model"""
    
    name = models.CharField(max_length=20, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'media_media_type'


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
