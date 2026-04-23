from rest_framework import serializers
from .models import Expense, BudgetCategory, ExpenseStatus

class ExpenseStatusSerializer(serializers.ModelSerializer):
    """Serializer for ExpenseStatus model"""
    
    class Meta:
        model = ExpenseStatus
        fields = ['id', 'name']
        read_only_fields = ['id']


class BudgetCategorySerializer(serializers.ModelSerializer):
    """Serializer for BudgetCategory model"""
    
    spent_amount = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    expense_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BudgetCategory
        fields = [
            'id', 'name', 'allocated_amount', 'spent_amount',
            'remaining_amount', 'expense_count'
        ]
        read_only_fields = ['id']
    
    def get_expense_count(self, obj):
        return obj.expenses.count()


class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for Expense model"""
    
    budget_category = BudgetCategorySerializer(read_only=True)
    budget_category_id = serializers.IntegerField(write_only=True)
    status = ExpenseStatusSerializer(read_only=True)
    status_id = serializers.IntegerField(write_only=True, required=False)
    vendor_name = serializers.CharField(source='vendor.vendor_catalog.name', read_only=True)
    remaining_balance = serializers.ReadOnlyField()
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'amount', 'paid_amount', 'budget_category',
            'budget_category_id', 'status', 'status_id', 'vendor', 'vendor_name',
            'expense_date', 'due_date', 'paid_date', 'notes', 'receipt_url',
            'remaining_balance', 'is_overdue', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class BudgetCategoryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating budget categories"""
    
    class Meta:
        model = BudgetCategory
        fields = ['name', 'allocated_amount']
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        return BudgetCategory.objects.create(wedding=wedding, **validated_data)


class ExpenseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating expenses"""
    
    class Meta:
        model = Expense
        fields = [
            'title', 'amount', 'budget_category_id', 'vendor_id',
            'expense_date', 'due_date', 'notes', 'receipt_url'
        ]
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        expense = Expense.objects.create(wedding=wedding, **validated_data)
        return expense

class BudgetCategoryUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating budget categories"""
    
    class Meta:
        model = BudgetCategory
        fields = ['name', 'allocated_amount']


class ExpenseUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating expenses"""
    
    class Meta:
        model = Expense
        fields = [
            'title', 'amount', 'paid_amount', 'budget_category_id',
            'status_id', 'vendor_id', 'expense_date', 'due_date',
            'paid_date', 'notes', 'receipt_url'
        ]

class ExpensePaymentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating expense payments"""
    
    class Meta:
        model = Expense
        fields = ['paid_amount', 'status_id', 'paid_date']
    
    def validate(self, attrs):
        paid_amount = attrs.get('paid_amount', self.instance.paid_amount)
        amount = self.instance.amount
        
        if paid_amount > amount:
            raise serializers.ValidationError("Amount paid cannot exceed the expense amount")
        
        return attrs
