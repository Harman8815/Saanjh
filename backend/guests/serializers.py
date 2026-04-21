from rest_framework import serializers
from .models import Guest

class GuestSerializer(serializers.ModelSerializer):
    """Serializer for Guest model"""
    
    class Meta:
        model = Guest
        fields = [
            'id', 'name', 'email', 'phone', 'rsvp_status', 'rsvp_date',
            'plus_one', 'plus_one_name', 'relationship', 'address',
            'dietary_restrictions', 'notes', 'invitation_sent',
            'invitation_sent_date', 'reminder_sent', 'reminder_sent_date',
            'added_date', 'updated_at'
        ]
        read_only_fields = ['id', 'added_date', 'updated_at']

class GuestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating guests"""
    
    class Meta:
        model = Guest
        fields = [
            'name', 'email', 'phone', 'relationship', 'address',
            'dietary_restrictions', 'notes', 'plus_one', 'plus_one_name'
        ]
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        guest = Guest.objects.create(wedding=wedding, **validated_data)
        return guest

class GuestUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating guests"""
    
    class Meta:
        model = Guest
        fields = [
            'name', 'email', 'phone', 'rsvp_status', 'rsvp_date',
            'plus_one', 'plus_one_name', 'relationship', 'address',
            'dietary_restrictions', 'notes', 'invitation_sent',
            'invitation_sent_date', 'reminder_sent', 'reminder_sent_date'
        ]

class GuestBulkCreateSerializer(serializers.Serializer):
    """Serializer for bulk creating guests"""
    guests = GuestCreateSerializer(many=True)
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        guests_data = validated_data['guests']
        guests = []
        for guest_data in guests_data:
            guests.append(Guest(wedding=wedding, **guest_data))
        return Guest.objects.bulk_create(guests)

class GuestRSVPUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating RSVP status"""
    
    class Meta:
        model = Guest
        fields = ['rsvp_status', 'rsvp_date', 'plus_one', 'plus_one_name']
