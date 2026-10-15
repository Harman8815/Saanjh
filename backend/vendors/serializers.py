from rest_framework import serializers
from django.db.models import Sum
from .models import (
    Vendor, VendorCategory, VendorStatus, VendorCatalog,
    VendorQuote, VendorContract, VendorMilestone, VendorCommunication
)

class VendorCategorySerializer(serializers.ModelSerializer):
    """Serializer for VendorCategory model"""
    
    class Meta:
        model = VendorCategory
        fields = ['id', 'name']
        read_only_fields = ['id']


class VendorStatusSerializer(serializers.ModelSerializer):
    """Serializer for VendorStatus model"""
    
    class Meta:
        model = VendorStatus
        fields = ['id', 'name']
        read_only_fields = ['id']


class VendorCatalogSerializer(serializers.ModelSerializer):
    """Serializer for VendorCatalog model"""
    
    category = VendorCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = VendorCatalog
        fields = [
            'id', 'name', 'contact', 'price_range', 'rating',
            'category', 'category_id'
        ]
        read_only_fields = ['id']


class VendorQuoteSerializer(serializers.ModelSerializer):
    """Serializer for VendorQuote model"""
    document_title = serializers.ReadOnlyField(source='document.title')

    class Meta:
        model = VendorQuote
        fields = [
            'id', 'vendor', 'title', 'amount', 'valid_until',
            'status', 'notes', 'document', 'document_title',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VendorContractSerializer(serializers.ModelSerializer):
    """Serializer for VendorContract model"""
    document_title = serializers.ReadOnlyField(source='document.title')

    class Meta:
        model = VendorContract
        fields = [
            'id', 'vendor', 'signed_date', 'terms', 'expiry_date',
            'document', 'document_title', 'deposit_amount', 'deposit_paid',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VendorMilestoneSerializer(serializers.ModelSerializer):
    """Serializer for VendorMilestone model"""

    class Meta:
        model = VendorMilestone
        fields = [
            'id', 'vendor', 'name', 'amount', 'due_date',
            'paid', 'paid_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VendorCommunicationSerializer(serializers.ModelSerializer):
    """Serializer for VendorCommunication model"""
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')

    class Meta:
        model = VendorCommunication
        fields = [
            'id', 'vendor', 'type', 'direction', 'subject', 'body',
            'occurred_at', 'follow_up_date', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class VendorSerializer(serializers.ModelSerializer):
    """Serializer for Vendor model"""
    
    vendor_catalog = VendorCatalogSerializer(read_only=True)
    vendor_catalog_id = serializers.IntegerField(write_only=True)
    status = VendorStatusSerializer(read_only=True)
    status_id = serializers.IntegerField(write_only=True, required=False)
    cost_variance = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    quotes = VendorQuoteSerializer(many=True, read_only=True)
    contract = VendorContractSerializer(read_only=True)
    milestones = VendorMilestoneSerializer(many=True, read_only=True)
    expenses_total = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'vendor_catalog', 'vendor_catalog_id', 'status', 'status_id',
            'cost_estimate', 'actual_cost', 'cost_variance', 'follow_up_date',
            'quotes', 'contract', 'milestones', 'expenses_total',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_expenses_total(self, obj):
        agg = obj.expenses.aggregate(total=Sum('amount'))
        return str(agg['total'] or 0.00)


class VendorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vendors"""
    
    class Meta:
        model = Vendor
        fields = ['vendor_catalog_id', 'cost_estimate', 'actual_cost', 'follow_up_date']
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        validated_data.pop('wedding', None)
        vendor = Vendor.objects.create(wedding=wedding, **validated_data)
        return vendor


class VendorUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating vendors"""
    
    class Meta:
        model = Vendor
        fields = ['vendor_catalog_id', 'status_id', 'cost_estimate', 'actual_cost', 'follow_up_date']


class VendorStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating vendor status"""
    
    class Meta:
        model = Vendor
        fields = ['status_id']


class VendorCatalogCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vendor catalog entries"""
    
    class Meta:
        model = VendorCatalog
        fields = ['name', 'contact', 'price_range', 'rating', 'category_id']

