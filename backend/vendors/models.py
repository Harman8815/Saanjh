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
        default=1  # Will be set to 'pending'
    )
    cost_estimate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    def __str__(self):
        return f"{self.vendor_catalog.name} - {self.vendor_catalog.category.name}"
    
    class Meta:
        db_table = 'vendors_vendor'
        ordering = ['vendor_catalog__category', 'vendor_catalog__name']
