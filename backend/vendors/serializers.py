from rest_framework import serializers
from .models import Vendor

class VendorSerializer(serializers.ModelSerializer):
    """Serializer for Vendor model"""
    vendor_type_display = serializers.CharField(source='get_vendor_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'vendor_type', 'vendor_type_display', 'status',
            'status_display', 'contact_person', 'email', 'phone', 'website',
            'address', 'cost', 'deposit_paid', 'booking_date', 'contract_signed',
            'contract_signed_date', 'services_provided', 'notes',
            'last_contact_date', 'next_follow_up', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class VendorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vendors"""
    
    class Meta:
        model = Vendor
        fields = [
            'name', 'vendor_type', 'contact_person', 'email', 'phone',
            'website', 'address', 'cost', 'deposit_paid', 'booking_date',
            'contract_signed', 'services_provided', 'notes'
        ]
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        vendor = Vendor.objects.create(wedding=wedding, **validated_data)
        return vendor

class VendorUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating vendors"""
    
    class Meta:
        model = Vendor
        fields = [
            'name', 'vendor_type', 'status', 'contact_person', 'email', 'phone',
            'website', 'address', 'cost', 'deposit_paid', 'booking_date',
            'contract_signed', 'contract_signed_date', 'services_provided',
            'notes', 'last_contact_date', 'next_follow_up'
        ]

class VendorStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating vendor status"""
    
    class Meta:
        model = Vendor
        fields = ['status', 'last_contact_date', 'next_follow_up']
