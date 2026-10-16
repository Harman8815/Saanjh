from django.db import models


class DocumentCategory(models.Model):
    """Document category model"""
    
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'documents_category'
        verbose_name_plural = 'Document Categories'


class DocumentTag(models.Model):
    """Document tag model"""
    
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'documents_tag'


class Document(models.Model):
    """Document model for wedding document management"""
    
    # Document categories
    CATEGORY_CHOICES = [
        ('contracts', 'Contracts'),
        ('invoices', 'Invoices/Bills'),
        ('ids', 'IDs & Personal Docs'),
        ('miscellaneous', 'Miscellaneous'),
    ]
    
    wedding = models.ForeignKey(
        'weddings.Wedding',
        on_delete=models.CASCADE,
        related_name='documents'
    )
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='miscellaneous'
    )
    
    # Document information
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='documents/%Y/%m/')
    file_type = models.CharField(max_length=50, blank=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    # Tags
    tags = models.ManyToManyField(DocumentTag, blank=True, related_name='documents')
    
    # Metadata
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    uploaded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_documents'
    )
    
    def __str__(self):
        return f"{self.name} - {self.wedding.get_couple_name() or 'Wedding'}"
    
    def save(self, *args, **kwargs):
        # Extract file type from filename
        if self.file and not self.file_type:
            filename = self.file.name
            extension = filename.split('.')[-1].lower() if '.' in filename else ''
            self.file_type = extension
        
        # Get file size
        if self.file and not self.file_size:
            self.file_size = self.file.size
            
        super().save(*args, **kwargs)
    
    def get_file_size_display(self):
        """Return human-readable file size"""
        if not self.file_size:
            return '0 B'
        
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"
    
    class Meta:
        db_table = 'documents_document'
        ordering = ['-uploaded_at']
        indexes = [
            # Documents are scoped by wedding and listed newest first.
            models.Index(fields=['wedding', 'uploaded_at']),
        ]


class DocumentVersion(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    file = models.FileField(upload_to='documents/versions/%Y/%m/')
    version_number = models.PositiveIntegerField()
    note = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='document_versions',
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'documents_document_version'
        ordering = ['-version_number']
        constraints = [
            models.UniqueConstraint(fields=['document', 'version_number'], name='unique_document_version_number'),
        ]


class DocumentAccess(models.Model):
    ACTION_CHOICES = [('download', 'Download'), ('preview', 'Preview')]

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='access_events')
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    at = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES, default='download')

    class Meta:
        db_table = 'documents_document_access'
        ordering = ['-at']
        indexes = [models.Index(fields=['document', 'at'])]
