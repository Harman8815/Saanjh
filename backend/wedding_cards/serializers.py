from rest_framework import serializers
from guests.models import Guest
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
        validated_data.pop('wedding', None)
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

    # Derived identity: these read through the linked Guest so the guest list
    # stays the single source of truth. They are read-only.
    display_name = serializers.CharField(read_only=True)
    display_email = serializers.EmailField(read_only=True)
    display_dietary_restrictions = serializers.CharField(read_only=True)
    guest_id = serializers.PrimaryKeyRelatedField(
        source='guest', queryset=Guest.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = WeddingCardGuest
        fields = [
            'id', 'guest', 'guest_id', 'source',
            'name', 'email', 'display_name', 'display_email',
            'rsvp_status', 'rsvp_date', 'plus_one', 'plus_one_name',
            'dietary_restrictions', 'display_dietary_restrictions', 'notes',
            'uploaded_photos'
        ]
        read_only_fields = ['id', 'source', 'rsvp_date']

    def validate(self, attrs):
        """A linked guest's identity is mirrored, so it cannot be overridden."""
        guest = attrs.get('guest') or getattr(self.instance, 'guest', None)
        if guest is not None:
            for duplicated in ('name', 'email', 'dietary_restrictions'):
                if duplicated in attrs:
                    raise serializers.ValidationError({
                        duplicated: [
                            'This comes from the linked guest and cannot be set here.'
                        ]
                    })
        return attrs

class WeddingCardGuestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating wedding card guests"""

    guest_id = serializers.PrimaryKeyRelatedField(
        source='guest', queryset=Guest.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = WeddingCardGuest
        fields = [
            'guest_id', 'name', 'email', 'rsvp_status', 'plus_one', 'plus_one_name',
            'dietary_restrictions', 'notes'
        ]

    def validate(self, attrs):
        """
        Either link a guest from the main list, or supply external details.

        A linked guest's identity is mirrored from Guest, so name/email and
        dietary restrictions cannot be overridden on the RSVP itself.
        """
        guest = attrs.get('guest') or getattr(self.instance, 'guest', None)

        if guest is None:
            if not (attrs.get('name') or '').strip():
                raise serializers.ValidationError({
                    'name': [
                        'A name is required unless a guest from the main list is linked.'
                    ]
                })
            return attrs

        conflicts = {
            field: ['This comes from the linked guest and cannot be set here.']
            for field in ('name', 'email', 'dietary_restrictions')
            if field in attrs
        }
        if conflicts:
            raise serializers.ValidationError(conflicts)
        return attrs
    
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
