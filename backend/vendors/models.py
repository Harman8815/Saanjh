from django.db import models


class VendorCategory(models.Model):
    """Vendor category model"""
    
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'vendors_vendor_category'


class VendorStatus(models.Model):
    """Vendor status model"""
    
    name = models.CharField(max_length=20, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'vendors_vendor_status'


class VendorCatalog(models.Model):
    """Master vendor catalog"""
    
    category = models.ForeignKey(
        VendorCategory,
        on_delete=models.PROTECT,
        related_name='catalog_vendors'
    )
    name = models.CharField(max_length=200)
    contact = models.CharField(max_length=200)
    price_range = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.FloatField(default=0.0)
    
    def __str__(self):
        return f"{self.name} - {self.category.name}"
    
    class Meta:
        db_table = 'vendors_vendor_catalog'



def _default_vendorstatus():
    """Resolve the canonical 'pending' VendorStatus, creating it if absent."""
    obj, _ = VendorStatus.objects.get_or_create(name='pending')
    return obj.pk


class Vendor(models.Model):
    """Vendor model for wedding service providers"""
    
    wedding = models.ForeignKey(
        'weddings.Wedding', 
        on_delete=models.CASCADE, 
        related_name='vendors'
    )
    vendor_catalog = models.ForeignKey(
        VendorCatalog,
        on_delete=models.PROTECT,
        related_name='wedding_vendors',
        null=True,
        blank=True
    )
    status = models.ForeignKey(
        VendorStatus,
        on_delete=models.PROTECT,
        default=_default_vendorstatus
    )
    cost_estimate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    follow_up_date = models.DateField(blank=True, null=True)

    # Timestamps. The dashboard's recent-activity feed orders vendors by
    # updated_at, and the "stuck in contacted" alert needs to know how long a
    # vendor has sat in one status.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vendor_catalog.name} - {self.vendor_catalog.category.name}"

    @property
    def cost_variance(self):
        """actual_cost - cost_estimate; None until an actual cost is recorded."""
        if self.actual_cost is None or self.cost_estimate is None:
            return None
        return self.actual_cost - self.cost_estimate

    class Meta:
        db_table = 'vendors_vendor'
        ordering = ['vendor_catalog__category', 'vendor_catalog__name']
        indexes = [
            # Vendors are scoped by wedding and filtered by status.
            models.Index(fields=['wedding', 'status']),
            # The dashboard feed orders by recency within a wedding.
            models.Index(fields=['wedding', '-updated_at']),
        ]


class VendorQuote(models.Model):
    """Vendor quote model"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='quotes')
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    valid_until = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    notes = models.TextField(blank=True, default='')
    document = models.ForeignKey(
        'documents.Document',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='vendor_quotes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Quote: {self.title} - {self.amount}"

    class Meta:
        db_table = 'vendors_vendor_quote'
        ordering = ['-created_at']


class VendorContract(models.Model):
    """Vendor contract model (one per vendor)"""
    vendor = models.OneToOneField(Vendor, on_delete=models.CASCADE, related_name='contract')
    signed_date = models.DateField(null=True, blank=True)
    terms = models.TextField(blank=True, default='')
    expiry_date = models.DateField(null=True, blank=True)
    document = models.ForeignKey(
        'documents.Document',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='vendor_contracts'
    )
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    deposit_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Contract for {self.vendor}"

    class Meta:
        db_table = 'vendors_vendor_contract'


class VendorMilestone(models.Model):
    """Vendor payment milestone model"""
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='milestones')
    name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(null=True, blank=True)
    paid = models.BooleanField(default=False)
    paid_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Milestone: {self.name} - {self.amount}"

    class Meta:
        db_table = 'vendors_vendor_milestone'
        ordering = ['due_date', 'id']


class VendorCommunication(models.Model):
    """Communication history log with vendor"""
    TYPE_CHOICES = [
        ('email', 'Email'),
        ('call', 'Call'),
        ('meeting', 'Meeting'),
        ('note', 'Note'),
    ]
    DIRECTION_CHOICES = [
        ('inbound', 'Inbound'),
        ('outbound', 'Outbound'),
    ]

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='communications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='note')
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES, default='outbound')
    subject = models.CharField(max_length=255)
    body = models.TextField(blank=True, default='')
    occurred_at = models.DateTimeField()
    follow_up_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(
        'accounts.User',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='vendor_communications'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.type.upper()}: {self.subject} ({self.occurred_at.date()})"

    class Meta:
        db_table = 'vendors_vendor_communication'
        ordering = ['-occurred_at']
