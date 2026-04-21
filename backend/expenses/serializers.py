from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for Expense model"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    remaining_balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'description', 'category', 'category_display', 'estimated_cost',
            'actual_cost', 'amount_paid', 'payment_status', 'payment_status_display',
            'vendor', 'vendor_name', 'expense_date', 'due_date', 'paid_date',
            'notes', 'receipt_url', 'remaining_balance', 'is_overdue',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ExpenseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating expenses"""
    
    class Meta:
        model = Expense
        fields = [
            'description', 'category', 'estimated_cost', 'actual_cost',
            'vendor', 'expense_date', 'due_date', 'notes', 'receipt_url'
        ]
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        expense = Expense.objects.create(wedding=wedding, **validated_data)
        return expense

class ExpenseUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating expenses"""
    
    class Meta:
        model = Expense
        fields = [
            'description', 'category', 'estimated_cost', 'actual_cost',
            'amount_paid', 'payment_status', 'vendor', 'expense_date',
            'due_date', 'paid_date', 'notes', 'receipt_url'
        ]

class ExpensePaymentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating expense payments"""
    
    class Meta:
        model = Expense
        fields = ['amount_paid', 'payment_status', 'paid_date']
    
    def validate(self, attrs):
        amount_paid = attrs.get('amount_paid', self.instance.amount_paid)
        actual_cost = attrs.get('actual_cost', self.instance.actual_cost) or self.instance.estimated_cost
        
        if amount_paid > actual_cost:
            raise serializers.ValidationError("Amount paid cannot exceed the actual cost")
        
        return attrs
