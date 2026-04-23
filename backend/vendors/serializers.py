from rest_framework import serializers
from .models import Vendor, VendorCategory, VendorStatus, VendorCatalog

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


class VendorSerializer(serializers.ModelSerializer):
    """Serializer for Vendor model"""
    
    vendor_catalog = VendorCatalogSerializer(read_only=True)
    vendor_catalog_id = serializers.IntegerField(write_only=True)
    status = VendorStatusSerializer(read_only=True)
    status_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'vendor_catalog', 'vendor_catalog_id', 'status', 'status_id',
            'cost_estimate', 'actual_cost'
        ]
        read_only_fields = ['id']

class VendorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vendors"""
    
    class Meta:
        model = Vendor
        fields = ['vendor_catalog_id', 'cost_estimate', 'actual_cost']
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        vendor = Vendor.objects.create(wedding=wedding, **validated_data)
        return vendor

class VendorUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating vendors"""
    
    class Meta:
        model = Vendor
        fields = ['vendor_catalog_id', 'status_id', 'cost_estimate', 'actual_cost']


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
