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
            'id', 'guest', 'source', 'name', 'email', 'rsvp_status', 'rsvp_date',
            'plus_one', 'plus_one_name', 'dietary_restrictions', 'notes',
            'uploaded_photos'
        ]
        read_only_fields = ['id', 'source', 'rsvp_date']

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

class PublicRsvpSerializer(serializers.Serializer):
    """
    Validated input for the public RSVP endpoint.

    The public endpoint is reachable by anyone holding the shareable link, so
    every field is explicitly validated: status values are constrained to the
    model's choices, and free-text fields are length-capped.
    """

    name = serializers.CharField(max_length=100, trim_whitespace=True)
    # Email identifies the RSVP row and prevents unauthenticated callers from
    # colliding on a null email (which would overwrite another guest's entry).
    email = serializers.EmailField()
    rsvp_status = serializers.ChoiceField(
        choices=[status for status, _ in WeddingCardGuest.RSVP_STATUS_CHOICES]
    )
    plus_one = serializers.BooleanField(required=False, default=False)
    plus_one_name = serializers.CharField(
        max_length=100, required=False, allow_blank=True, trim_whitespace=True
    )
    dietary_restrictions = serializers.CharField(
        max_length=1000, required=False, allow_blank=True, trim_whitespace=True
    )
    notes = serializers.CharField(
        max_length=1000, required=False, allow_blank=True, trim_whitespace=True
    )


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
