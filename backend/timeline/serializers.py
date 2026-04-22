from rest_framework import serializers
from .models import Timeline, TimelineEvent, TimelineStatus


class TimelineStatusSerializer(serializers.ModelSerializer):
    """Serializer for TimelineStatus model"""
    
    class Meta:
        model = TimelineStatus
        fields = ['id', 'name']
        read_only_fields = ['id']


class TimelineEventSerializer(serializers.ModelSerializer):
    """Serializer for TimelineEvent model"""
    
    status = TimelineStatusSerializer(read_only=True)
    status_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = TimelineEvent
        fields = [
            'id', 'title', 'event_date', 'start_time', 'end_time',
            'status', 'status_id'
        ]
        read_only_fields = ['id']


class TimelineSerializer(serializers.ModelSerializer):
    """Serializer for Timeline model"""
    
    events = TimelineEventSerializer(many=True, read_only=True)
    
    class Meta:
        model = Timeline
        fields = ['id', 'name', 'events']
        read_only_fields = ['id']


class TimelineCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating timeline"""
    
    class Meta:
        model = Timeline
        fields = ['name']
    
    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        timeline = Timeline.objects.create(wedding=wedding, **validated_data)
        return timeline


class TimelineEventCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating timeline events"""
    
    class Meta:
        model = TimelineEvent
        fields = ['title', 'event_date', 'start_time', 'end_time', 'status_id']
    
    def create(self, validated_data):
        # Get the timeline for the current user's wedding
        wedding = self.context['request'].user.wedding
        timeline, created = Timeline.objects.get_or_create(
            wedding=wedding,
            defaults={'name': f"{wedding.get_couple_name() or 'Wedding'} Timeline"}
        )
        validated_data['timeline'] = timeline
        return TimelineEvent.objects.create(**validated_data)


class TimelineEventUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating timeline events"""
    
    class Meta:
        model = TimelineEvent
        fields = ['title', 'event_date', 'start_time', 'end_time', 'status_id']
