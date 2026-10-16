from rest_framework import serializers
from .models import (
    Guest, RsvpStatus, Table, Meal, GuestMeal,
    GuestGroup, DietaryOption
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


class DietaryOptionSerializer(serializers.ModelSerializer):
    """Serializer for global dietary options"""

    class Meta:
        model = DietaryOption
        fields = ['id', 'name']
        read_only_fields = ['id']


class GuestGroupSerializer(serializers.ModelSerializer):
    """Read serializer for guest groups, with member count."""
    
    guest_count = serializers.SerializerMethodField()
    
    class Meta:
        model = GuestGroup
        fields = [
            'id', 'name', 'side', 'side_display', 'group_type',
            'group_type_display', 'notes', 'guest_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    side_display = serializers.CharField(source='get_side_display', read_only=True)
    group_type_display = serializers.CharField(
        source='get_group_type_display', read_only=True
    )
    
    def get_guest_count(self, obj):
        return obj.guests.count()


class GuestGroupCreateSerializer(serializers.ModelSerializer):
    """Write serializer for guest groups (scoped to the request wedding)."""
    
    class Meta:
        model = GuestGroup
        fields = ['name', 'side', 'group_type', 'notes']
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        validated_data.pop('wedding', None)
        return GuestGroup.objects.create(wedding=wedding, **validated_data)


class GuestGroupUpdateSerializer(serializers.ModelSerializer):
    """Update serializer for guest groups"""
    
    class Meta:
        model = GuestGroup
        fields = ['name', 'side', 'group_type', 'notes']


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
    group = GuestGroupSerializer(read_only=True)
    group_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    plus_one_rsvp_status = RsvpStatusSerializer(read_only=True)
    plus_one_rsvp_status_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    # Read via SerializerMethodField rather than source='...meal': a source
    # path cannot traverse the related manager to the junction target, and
    # DRF then silently skips the field (a bug the guest list shipped with).
    meal_preferences = serializers.SerializerMethodField()
    meal_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    dietary_preferences = serializers.SerializerMethodField()
    dietary_ids = serializers.ListField(
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
            'added_date', 'updated_at',
            # Groups and plus-ones
            'group', 'group_id', 'plus_one_name', 'plus_one_rsvp_status',
            'plus_one_rsvp_status_id', 'is_plus_one_of',
            # Structured dietary preferences
            'dietary_preferences', 'dietary_ids',
        ]
        read_only_fields = ['id', 'added_date', 'updated_at']

    def get_meal_preferences(self, obj):
        return MealSerializer(
            [gm.meal for gm in obj.meal_preferences.select_related('meal')], many=True
        ).data

    def get_dietary_preferences(self, obj):
        return DietaryOptionSerializer(
            [gd.option for gd in obj.dietary_preferences.select_related('option')],
            many=True
        ).data

    def _validate_reference_ids(self, attrs, instance=None):
        """
        Check relation ids against the request wedding before they are used.

        table_id / group_id / is_plus_one_of must reference rows in the same
        wedding, otherwise a crafted request could point a guest at another
        user's table or guest.
        """
        wedding = self.context['request'].user.wedding

        if 'group_id' in attrs and attrs['group_id'] is not None:
            if not GuestGroup.objects.filter(
                id=attrs['group_id'], wedding=wedding
            ).exists():
                raise serializers.ValidationError(
                    {'group_id': 'Group not found in this wedding.'}
                )

        if 'table_id' in attrs and attrs['table_id'] is not None:
            if not Table.objects.filter(
                id=attrs['table_id'], wedding=wedding
            ).exists():
                raise serializers.ValidationError(
                    {'table_id': 'Table not found in this wedding.'}
                )

        if 'is_plus_one_of' in attrs and attrs['is_plus_one_of'] is not None:
            plus_one_of = attrs['is_plus_one_of']
            if plus_one_of.wedding_id != wedding.id:
                raise serializers.ValidationError(
                    {'is_plus_one_of': 'Guest not found in this wedding.'}
                )
            if instance is not None and plus_one_of.id == instance.id:
                raise serializers.ValidationError(
                    {'is_plus_one_of': 'A guest cannot be their own plus-one.'}
                )
            if plus_one_of.is_plus_one_of is not None:
                raise serializers.ValidationError(
                    {'is_plus_one_of': 'That guest is already a plus-one.'}
                )

        if 'plus_one_rsvp_status_id' in attrs and attrs['plus_one_rsvp_status_id'] is not None:
            if not RsvpStatus.objects.filter(id=attrs['plus_one_rsvp_status_id']).exists():
                raise serializers.ValidationError(
                    {'plus_one_rsvp_status_id': 'Invalid RSVP status.'}
                )

        return attrs

class GuestCreateSerializer(GuestSerializer):
    """Serializer for creating guests"""
    
    class Meta:
        model = Guest
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'relationship',
            'address', 'dietary_restrictions', 'notes', 'meal_ids',
            'group_id', 'plus_one_name', 'plus_one_rsvp_status_id',
            'is_plus_one_of', 'dietary_ids'
        ]
    
    def validate(self, attrs):
        return self._validate_reference_ids(attrs)
    
    def create(self, validated_data):
        meal_ids = validated_data.pop('meal_ids', [])
        dietary_ids = validated_data.pop('dietary_ids', [])
        wedding = self.context['request'].user.wedding
        validated_data.pop('wedding', None)
        # is_plus_one_of points at another guest, so it can be set directly.
        guest = Guest.objects.create(wedding=wedding, **validated_data)
        
        # Create meal preferences
        for meal_id in meal_ids:
            GuestMeal.objects.create(guest=guest, meal_id=meal_id)
        
        # Create dietary preferences
        for option_id in dietary_ids:
            guest.dietary_preferences.create(option_id=option_id)
        
        return guest

class GuestUpdateSerializer(GuestSerializer):
    """Serializer for updating guests"""
    
    class Meta:
        model = Guest
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'rsvp_status_id',
            'rsvp_date', 'table_id', 'relationship', 'address',
            'dietary_restrictions', 'notes', 'invitation_sent',
            'invitation_sent_date', 'reminder_sent', 'reminder_sent_date',
            'meal_ids', 'group_id', 'plus_one_name',
            'plus_one_rsvp_status_id', 'is_plus_one_of'
        ]
    
    def validate(self, attrs):
        return self._validate_reference_ids(attrs, instance=self.instance)
    
    def update(self, instance, validated_data):
        meal_ids = validated_data.pop('meal_ids', None)
        dietary_ids = validated_data.pop('dietary_ids', None)
        
        # Update guest fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update meal preferences if provided
        if meal_ids is not None:
            instance.meal_preferences.all().delete()
            for meal_id in meal_ids:
                GuestMeal.objects.create(guest=instance, meal_id=meal_id)
        
        # Update dietary preferences if provided
        if dietary_ids is not None:
            instance.dietary_preferences.all().delete()
            for option_id in dietary_ids:
                instance.dietary_preferences.create(option_id=option_id)
        
        return instance

class GuestBulkCreateSerializer(serializers.Serializer):
    """Serializer for bulk creating guests"""
    guests = GuestCreateSerializer(many=True)
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        validated_data.pop('wedding', None)
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
        validated_data.pop('wedding', None)
        return Table.objects.create(wedding=wedding, **validated_data)
