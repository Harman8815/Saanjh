from django.db import models
from django.utils import timezone


class ExpenseStatus(models.Model):
    """Expense status model"""
    
    name = models.CharField(max_length=20, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'expenses_expense_status'


class BudgetCategory(models.Model):
    """Budget category model"""
    
    wedding = models.ForeignKey(
        'weddings.Wedding',
        on_delete=models.CASCADE,
        related_name='budget_categories'
    )
    name = models.CharField(max_length=100)
    allocated_amount = models.DecimalField(max_digits=10, decimal_places=2)
    alert_threshold_pct = models.PositiveSmallIntegerField(default=90)
    
    def __str__(self):
        return f"{self.name} - {self.wedding.get_couple_name() or 'Wedding'}"
    
    def spent_amount(self):
        """Calculate total spent in this category (non-cancelled expenses only)."""
        from django.db.models import Sum, Q
        return self.expenses.exclude(
            Q(status__name__iexact='cancelled') | Q(status__name__iexact='canceled')
        ).aggregate(total=Sum('amount'))['total'] or 0
    
    def remaining_amount(self):
        """Calculate remaining budget for this category."""
        return self.allocated_amount - self.spent_amount()
    
    def is_alert_triggered(self):
        """Check if category spending exceeds alert threshold."""
        if self.allocated_amount == 0:
            return False
        return (self.spent_amount() / self.allocated_amount * 100) >= self.alert_threshold_pct
    
    class Meta:
        db_table = 'expenses_budget_category'
        unique_together = ['wedding', 'name']


def _default_expensestatus():
    """Resolve the canonical 'pending' ExpenseStatus, creating it if absent."""
    obj, _ = ExpenseStatus.objects.get_or_create(name='pending')
    return obj.pk


class PaymentSchedule(models.Model):
    """Recurring or planned payment schedule for expenses."""
    
    FREQUENCY_CHOICES = [
        ('once', 'One-time'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    wedding = models.ForeignKey(
        'weddings.Wedding',
        on_delete=models.CASCADE,
        related_name='payment_schedules'
    )
    budget_category = models.ForeignKey(
        BudgetCategory,
        on_delete=models.CASCADE,
        related_name='payment_schedules'
    )
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='once')
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    next_due_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.amount} ({self.get_frequency_display()})"
    
    def get_next_occurrences(self, count=5):
        """Generate next N occurrence dates based on frequency."""
        from dateutil.relativedelta import relativedelta
        dates = []
        current = self.next_due_date
        delta_map = {
            'once': None,
            'weekly': relativedelta(weeks=1),
            'monthly': relativedelta(months=1),
            'quarterly': relativedelta(months=3),
            'yearly': relativedelta(years=1),
        }
        delta = delta_map.get(self.frequency)
        for _ in range(count):
            if delta is None:
                dates.append(current)
                break
            dates.append(current)
            current += delta
            if self.end_date and current > self.end_date:
                break
        return dates
    
    class Meta:
        db_table = 'expenses_payment_schedule'
        ordering = ['next_due_date']


class ExpenseReceipt(models.Model):
    """Receipt/attachment for an expense."""
    
    expense = models.ForeignKey(
        'Expense',
        on_delete=models.CASCADE,
        related_name='receipts'
    )
    file = models.FileField(upload_to='expense_receipts/%Y/%m/')
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    mime_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Receipt for {self.expense.title}"
    
    class Meta:
        db_table = 'expenses_expense_receipt'
        ordering = ['-uploaded_at']


class Expense(models.Model):
    """Expense model for wedding budget tracking"""
    
    wedding = models.ForeignKey(
        'weddings.Wedding', 
        on_delete=models.CASCADE, 
        related_name='expenses'
    )
    budget_category = models.ForeignKey(
        BudgetCategory,
        on_delete=models.PROTECT,
        related_name='expenses',
        null=True,
        blank=True
    )
    vendor = models.ForeignKey(
        'vendors.Vendor', 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True,
        related_name='expenses'
    )
    status = models.ForeignKey(
        ExpenseStatus,
        on_delete=models.PROTECT,
        default=_default_expensestatus
    )
    
    # Basic information
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
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
        cat = self.budget_category.name if self.budget_category else 'Uncategorized'
        return f"{self.title} - {cat} (${self.amount})"
    
    def remaining_balance(self):
        """Calculate remaining balance"""
        return self.amount - self.paid_amount
    
    def is_paid_off(self):
        """Check if expense is fully paid."""
        return self.remaining_balance() <= 0
    
    def is_overdue(self):
        """Check if payment is overdue"""
        if self.status.name == 'paid':
            return False
        if not self.due_date:
            return False
        return timezone.now().date() > self.due_date
    
    class Meta:
        db_table = 'expenses_expense'
        ordering = ['-expense_date', 'budget_category', 'title']
        indexes = [
            models.Index(fields=['wedding', 'expense_date']),
            models.Index(fields=['wedding', 'status']),
        ]