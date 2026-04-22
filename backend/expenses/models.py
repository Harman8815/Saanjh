from django.db import models


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
    
    def __str__(self):
        return f"{self.name} - {self.wedding.get_couple_name() or 'Wedding'}"
    
    def spent_amount(self):
        """Calculate total spent in this category"""
        return sum(
            expense.amount for expense in self.expenses.all()
        )
    
    def remaining_amount(self):
        """Calculate remaining budget for this category"""
        return self.allocated_amount - self.spent_amount()
    
    class Meta:
        db_table = 'expenses_budget_category'
        unique_together = ['wedding', 'name']


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
        default=1  # Will be set to 'pending'
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
        return f"{self.title} - {self.budget_category.name} (${self.amount})"
    
    def remaining_balance(self):
        """Calculate remaining balance"""
        return self.amount - self.paid_amount
    
    def is_overdue(self):
        """Check if payment is overdue"""
        if self.status.name == 'paid':
            return False
        if not self.due_date:
            return False
        from django.utils import timezone
        return timezone.now().date() > self.due_date
    
    class Meta:
        db_table = 'expenses_expense'
        ordering = ['-expense_date', 'budget_category', 'title']
