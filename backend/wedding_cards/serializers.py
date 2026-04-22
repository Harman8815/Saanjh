from rest_framework import serializers
from .models import WeddingCard, WeddingCardGuest, WeddingCardAnalytics

class WeddingCardSerializer(serializers.ModelSerializer):
    """Serializer for WeddingCard model"""
    template_display = serializers.CharField(source='get_template_display', read_only=True)
    font_style_display = serializers.CharField(source='get_font_style_display', read_only=True)
    
    class Meta:
        model = WeddingCard
        fields = [
            'id', 'template', 'template_display', 'couple_names', 'wedding_details',
            'primary_color', 'font_style', 'font_style_display', 'photos',
            'allow_guest_photos', 'require_rsvp', 'send_reminders',
            'shareable_link', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'shareable_link', 'created_at', 'updated_at']

class WeddingCardCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating wedding cards"""
    
    class Meta:
        model = WeddingCard
        fields = [
            'template', 'couple_names', 'wedding_details', 'primary_color',
            'font_style', 'photos', 'allow_guest_photos', 'require_rsvp',
            'send_reminders'
        ]
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        card = WeddingCard.objects.create(wedding=wedding, **validated_data)
        # Create analytics record
        WeddingCardAnalytics.objects.create(wedding_card=card)
        return card

class WeddingCardUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating wedding cards"""
    
    class Meta:
        model = WeddingCard
        fields = [
            'template', 'couple_names', 'wedding_details', 'primary_color',
            'font_style', 'photos', 'allow_guest_photos', 'require_rsvp',
            'send_reminders'
        ]

class WeddingCardGuestSerializer(serializers.ModelSerializer):
    """Serializer for WeddingCardGuest model"""
    
    class Meta:
        model = WeddingCardGuest
        fields = [
            'id', 'guest', 'name', 'email', 'rsvp_status', 'rsvp_date',
            'plus_one', 'plus_one_name', 'dietary_restrictions', 'notes',
            'uploaded_photos'
        ]
        read_only_fields = ['id', 'rsvp_date']

class WeddingCardGuestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating wedding card guests"""
    
    class Meta:
        model = WeddingCardGuest
        fields = [
            'name', 'email', 'rsvp_status', 'plus_one', 'plus_one_name',
            'dietary_restrictions', 'notes'
        ]
    
    def create(self, validated_data):
        wedding_card = self.context['wedding_card']
        guest = WeddingCardGuest.objects.create(wedding_card=wedding_card, **validated_data)
        return guest

class WeddingCardAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for WeddingCardAnalytics model"""
    rsvp_rate = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = WeddingCardAnalytics
        fields = [
            'id', 'total_views', 'unique_views', 'total_rsvps',
            'confirmed_rsvps', 'declined_rsvps', 'total_photos_uploaded',
            'rsvp_rate', 'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']
