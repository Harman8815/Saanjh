from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action

from utils.api_response import APIResponse, get_request_wedding
from utils.api_exceptions import handle_api_exceptions

from .models import Reminder
from .serializers import ReminderSerializer, ReminderCreateSerializer
from .delivery import send_reminder


class ReminderViewSet(viewsets.ModelViewSet):
    """
    Reminders for the current user's wedding.

    Only listing, creating, and cancelling are exposed: delivery itself is
    owned by the Celery task / management command, never by a request.
    """

    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            wedding = get_request_wedding(self.request)
        except Exception:
            return Reminder.objects.none()
        return Reminder.objects.filter(wedding=wedding)

    def get_serializer_class(self):
        if self.action == 'create':
            return ReminderCreateSerializer
        return ReminderSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Reminders retrieved successfully")

    def create(self, request, *args, **kwargs):
        serializer = ReminderCreateSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        reminder = serializer.save()
        return APIResponse.created(
            ReminderSerializer(reminder).data,
            "Reminder scheduled successfully"
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a pending reminder; already-sent ones cannot be recalled."""
        reminder = self.get_object()
        if reminder.status not in ('pending', 'sending'):
            return APIResponse.error(
                f"Only pending reminders can be cancelled (this one is {reminder.status}).",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        reminder.status = 'cancelled'
        reminder.save(update_fields=['status', 'updated_at'])
        return APIResponse.success(
            ReminderSerializer(reminder).data,
            "Reminder cancelled successfully"
        )

    @action(detail=False, methods=['post'])
    def test_send(self, request):
        """
        Schedule and immediately send a test email to the current user.

        Useful to verify the email configuration from the UI without waiting
        for the beat schedule. Uses the configured email backend, so in
        development the message is printed to the console.
        """
        wedding = get_request_wedding(request)
        recipient = request.user.email
        if not recipient:
            return APIResponse.error(
                "Your account has no email address to send a test message to.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        from django.utils import timezone

        reminder = Reminder.objects.create(
            wedding=wedding,
            kind='test',
            channel='email',
            to_email=recipient,
            subject='Saanjh test reminder',
            message=(
                'This is a test reminder from Saanjh. '
                'If you received it, email delivery is configured correctly.'
            ),
            scheduled_for=timezone.now(),
        )

        send_reminder(reminder)
        reminder.refresh_from_db()
        return APIResponse.success(
            ReminderSerializer(reminder).data,
            "Test reminder sent" if reminder.status == 'sent'
            else "Test reminder could not be sent"
        )
