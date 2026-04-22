from django.db import models

class Expense(models.Model):
    """Expense model for wedding budget tracking"""
    
    CATEGORIES = [
        ('venue', 'Venue'),
        ('catering', 'Catering'),
        ('photography', 'Photography'),
        ('videography', 'Videography'),
        ('florist', 'Florist'),
        ('music', 'Music/Entertainment'),
        ('cake', 'Cake'),
        ('decorations', 'Decorations'),
        ('attire', 'Attire'),
        ('rings', 'Rings'),
        ('transportation', 'Transportation'),
        ('accommodation', 'Accommodation'),
        ('invitations', 'Invitations'),
        ('gifts', 'Gifts'),
        ('other', 'Other'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]
    
    # Basic information
    wedding = models.ForeignKey(
        'weddings.Wedding', 
        on_delete=models.CASCADE, 
        related_name='expenses'
    )
    description = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    
    # Financial details
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Vendor association
    vendor = models.ForeignKey(
        'vendors.Vendor', 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True,
        related_name='expenses'
    )
    
    # Date information
    expense_date = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    paid_date = models.DateField(blank=True, null=True)
    
    # Additional details
    notes = models.TextField(blank=True, null=True)
    receipt_url = models.URLField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.description} - {self.get_category_display()} (${self.actual_cost or self.estimated_cost})"
    
    def remaining_balance(self):
        """Calculate remaining balance"""
        cost = self.actual_cost if self.actual_cost is not None else self.estimated_cost
        return cost - self.amount_paid
    
    def is_overdue(self):
        """Check if payment is overdue"""
        if self.payment_status == 'paid':
            return False
        if not self.due_date:
            return False
        from django.utils import timezone
        return timezone.now().date() > self.due_date
    
    class Meta:
        db_table = 'expenses_expense'
        ordering = ['-expense_date', 'category', 'description']
