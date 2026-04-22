from rest_framework import serializers
from .models import Wedding

class WeddingSerializer(serializers.ModelSerializer):
    """Serializer for Wedding model"""
    couple_names = serializers.SerializerMethodField()
    days_until_wedding = serializers.ReadOnlyField()
    
    class Meta:
        model = Wedding
        fields = [
            'id', 'bride_name', 'groom_name', 'partner_name', 'couple_names',
            'wedding_date', 'venue', 'venue_address', 'guest_count', 'budget',
            'website_url', 'website_domain', 'status', 'days_until_wedding',
            'created_at', 'updated_at'
        ]
    
    def get_couple_names(self, obj):
        return obj.get_couple_name()

class WeddingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a wedding"""
    
    class Meta:
        model = Wedding
        fields = [
            'bride_name', 'groom_name', 'partner_name', 'wedding_date',
            'venue', 'venue_address', 'guest_count', 'budget'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        wedding = Wedding.objects.create(user=user, **validated_data)
        return wedding

class WeddingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating wedding details"""
    
    class Meta:
        model = Wedding
        fields = [
            'bride_name', 'groom_name', 'partner_name', 'wedding_date',
            'venue', 'venue_address', 'guest_count', 'budget', 'status',
            'website_url', 'website_domain'
        ]
