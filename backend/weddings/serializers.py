from rest_framework import serializers
from .models import (
    Wedding, WeddingStatus, Venue, VenueCatalog, 
    VenueAmenity, VenueAmenityMap
)

class WeddingStatusSerializer(serializers.ModelSerializer):
    """Serializer for WeddingStatus model"""
    
    class Meta:
        model = WeddingStatus
        fields = ['id', 'name']
        read_only_fields = ['id']


class VenueAmenitySerializer(serializers.ModelSerializer):
    """Serializer for VenueAmenity model"""
    
    class Meta:
        model = VenueAmenity
        fields = ['id', 'name']
        read_only_fields = ['id']


class VenueCatalogSerializer(serializers.ModelSerializer):
    """Serializer for VenueCatalog model"""
    
    amenities = VenueAmenitySerializer(source='amenity_mappings.amenity', many=True, read_only=True)
    
    class Meta:
        model = VenueCatalog
        fields = [
            'id', 'name', 'type', 'address', 'capacity_min', 'capacity_max',
            'price', 'rating', 'amenities'
        ]
        read_only_fields = ['id']


class VenueSerializer(serializers.ModelSerializer):
    """Serializer for Venue model"""
    
    venue_catalog = VenueCatalogSerializer(read_only=True)
    venue_catalog_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Venue
        fields = ['id', 'venue_catalog', 'venue_catalog_id']
        read_only_fields = ['id']


class WeddingSerializer(serializers.ModelSerializer):
    """Serializer for Wedding model"""
    
    couple_names = serializers.SerializerMethodField()
    days_until_wedding = serializers.ReadOnlyField()
    status = WeddingStatusSerializer(read_only=True)
    venue = VenueSerializer(read_only=True)
    venue_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Wedding
        fields = [
            'id', 'user', 'couple_names', 'wedding_date', 'theme',
            'status', 'venue', 'venue_id', 'days_until_wedding',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_couple_names(self, obj):
        return obj.get_couple_name()

class WeddingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a wedding"""
    
    class Meta:
        model = Wedding
        fields = ['wedding_date', 'theme', 'venue_id']
    
    def create(self, validated_data):
        user = self.context['request'].user
        wedding = Wedding.objects.create(user=user, **validated_data)
        return wedding

class WeddingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating wedding details"""
    
    class Meta:
        model = Wedding
        fields = ['wedding_date', 'theme', 'venue_id', 'status']


class VenueCatalogCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating venue catalog entries"""
    
    amenity_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = VenueCatalog
        fields = [
            'name', 'type', 'address', 'capacity_min', 'capacity_max',
            'price', 'rating', 'amenity_ids'
        ]
    
    def create(self, validated_data):
        amenity_ids = validated_data.pop('amenity_ids', [])
        venue = VenueCatalog.objects.create(**validated_data)
        
        # Create amenity mappings
        for amenity_id in amenity_ids:
            VenueAmenityMap.objects.create(
                venue_catalog=venue,
                amenity_id=amenity_id
            )
        
        return venue
