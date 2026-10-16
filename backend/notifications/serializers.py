from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
from .models import Reminder


class ReminderSerializer(serializers.ModelSerializer):
    """Read serializer for reminders (list/detail/cancel/test-send)."""

    kind_display = serializers.CharField(source='get_kind_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_due = serializers.SerializerMethodField()

    class Meta:
        model = Reminder
        fields = [
            'id', 'kind', 'kind_display', 'channel', 'scheduled_for', 'status',
            'status_display', 'is_due', 'to_email', 'subject', 'message',
            'target_type', 'target_id', 'sent_at', 'error', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_is_due(self, obj):
        from django.utils import timezone
        return obj.status == 'pending' and obj.scheduled_for <= timezone.now()


class ReminderCreateSerializer(serializers.ModelSerializer):
    """
    Write serializer for scheduling a reminder.

    The wedding is injected from the request, never accepted from the body.
    ``target_type``/``target_id`` are validated against a whitelist of
    wedding-scoped models so a reminder cannot reference arbitrary rows.
    """

    target_type = serializers.PrimaryKeyRelatedField(
        queryset=ContentType.objects.all(), required=False, allow_null=True
    )
    target_id = serializers.IntegerField(required=False, allow_null=True)

    # Models a reminder may point at, as '<app_label>.<model>' lookups.
    ALLOWED_TARGETS = {
        'guests.guest',
        'expenses.expense',
        'vendors.vendor',
        'tasks.task',
        'documents.document',
        'timeline.timelineevent',
    }

    class Meta:
        model = Reminder
        fields = [
            'kind', 'channel', 'scheduled_for', 'to_email', 'subject',
            'message', 'target_type', 'target_id',
        ]

    def validate_target_type(self, value):
        if value is None:
            return value
        label = f'{value.app_label}.{value.model}'
        if label not in self.ALLOWED_TARGETS:
            raise serializers.ValidationError(
                f'Reminders cannot target {label}.'
            )
        return value

    def validate(self, attrs):
        if attrs.get('target_type') and not attrs.get('target_id'):
            raise serializers.ValidationError(
                {'target_id': 'A target id is required when target_type is set.'}
            )
        if attrs.get('channel') == 'email' and not attrs.get('to_email'):
            raise serializers.ValidationError(
                {'to_email': 'Email reminders need a recipient address.'}
            )
        return attrs

    def create(self, validated_data):
        wedding = self.context['request'].user.wedding
        return Reminder.objects.create(wedding=wedding, **validated_data)
