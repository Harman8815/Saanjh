from rest_framework import serializers
from .models import (
    Guest, RsvpStatus, Table, Meal, GuestMeal
)

class RsvpStatusSerializer(serializers.ModelSerializer):
    """Serializer for RsvpStatus model"""
    
    class Meta:
        model = RsvpStatus
        fields = ['id', 'name']
        read_only_fields = ['id']


class MealSerializer(serializers.ModelSerializer):
    """Serializer for Meal model"""
    
    class Meta:
        model = Meal
        fields = ['id', 'name']
        read_only_fields = ['id']


class TableSerializer(serializers.ModelSerializer):
    """Serializer for Table model"""
    
    assigned_guests = serializers.SerializerMethodField()
    available_seats = serializers.SerializerMethodField()
    
    class Meta:
        model = Table
        fields = [
            'id', 'table_number', 'capacity', 'assigned_guests',
            'available_seats'
        ]
        read_only_fields = ['id']
    
    def get_assigned_guests(self, obj):
        return obj.assigned_guests.count()
    
    def get_available_seats(self, obj):
        return obj.capacity - obj.assigned_guests.count()


class GuestSerializer(serializers.ModelSerializer):
    """Serializer for Guest model"""
    
    full_name = serializers.ReadOnlyField()
    rsvp_status = RsvpStatusSerializer(read_only=True)
    rsvp_status_id = serializers.IntegerField(write_only=True, required=False)
    table = TableSerializer(read_only=True)
    table_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    meal_preferences = MealSerializer(source='meal_preferences.meal', many=True, read_only=True)
    meal_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Guest
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'rsvp_status', 'rsvp_status_id', 'rsvp_date', 'table', 'table_id',
            'meal_preferences', 'meal_ids', 'relationship', 'address',
            'dietary_restrictions', 'notes', 'invitation_sent',
            'invitation_sent_date', 'reminder_sent', 'reminder_sent_date',
            'added_date', 'updated_at'
        ]
        read_only_fields = ['id', 'added_date', 'updated_at']

class GuestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating guests"""
    
    meal_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Guest
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'relationship',
            'address', 'dietary_restrictions', 'notes', 'meal_ids'
        ]
    
    def create(self, validated_data):
        meal_ids = validated_data.pop('meal_ids', [])
        wedding = self.context['request'].user.wedding
        guest = Guest.objects.create(wedding=wedding, **validated_data)
        
        # Create meal preferences
        for meal_id in meal_ids:
            GuestMeal.objects.create(guest=guest, meal_id=meal_id)
        
        return guest

class GuestUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating guests"""
    
    meal_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Guest
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'rsvp_status_id',
            'rsvp_date', 'table_id', 'relationship', 'address',
            'dietary_restrictions', 'notes', 'invitation_sent',
            'invitation_sent_date', 'reminder_sent', 'reminder_sent_date',
            'meal_ids'
        ]
    
    def update(self, instance, validated_data):
        meal_ids = validated_data.pop('meal_ids', None)
        
        # Update guest fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update meal preferences if provided
        if meal_ids is not None:
            instance.meal_preferences.all().delete()
            for meal_id in meal_ids:
                GuestMeal.objects.create(guest=instance, meal_id=meal_id)
        
        return instance

class GuestBulkCreateSerializer(serializers.Serializer):
    """Serializer for bulk creating guests"""
    guests = GuestCreateSerializer(many=True)
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        guests_data = validated_data['guests']
        guests = []
        guest_meal_mappings = []
        
        for guest_data in guests_data:
            meal_ids = guest_data.pop('meal_ids', [])
            guest = Guest(wedding=wedding, **guest_data)
            guests.append(guest)
            
            # Store meal mappings for later creation
            for meal_id in meal_ids:
                guest_meal_mappings.append((guest, meal_id))
        
        # Bulk create guests
        created_guests = Guest.objects.bulk_create(guests)
        
        # Create meal preferences
        for i, (guest, meal_id) in enumerate(guest_meal_mappings):
            GuestMeal.objects.create(guest=created_guests[i], meal_id=meal_id)
        
        return created_guests

class GuestRSVPUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating RSVP status"""
    
    class Meta:
        model = Guest
        fields = ['rsvp_status_id', 'rsvp_date']


class TableCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tables"""
    
    class Meta:
        model = Table
        fields = ['table_number', 'capacity']
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        return Table.objects.create(wedding=wedding, **validated_data)
