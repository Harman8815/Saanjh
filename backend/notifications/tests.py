"""
Tests for the notifications app: delivery, the management command, and the
reminder API (list/create/cancel/test-send).

The email backend is replaced by locmem under the Django test environment, so
``mail.outbox`` captures what would have been sent.
"""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from io import StringIO
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from notifications.delivery import send_due_reminders
from notifications.models import Reminder
from notifications.tasks import send_due_reminders as send_due_reminders_task
from weddings.models import Wedding, WeddingStatus

User = get_user_model()


class ReminderDeliveryTestCase(TestCase):
    """Core delivery behaviour of notifications.delivery."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='couple', email='couple@example.com', password='testpass123'
        )
        self.wedding = Wedding.objects.create(
            user=self.user,
            wedding_date=timezone.now().date() + timedelta(days=90),
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )

    def make_reminder(self, scheduled_for=None, to_email='guest@example.com',
                      channel='email', status='pending', claimed_at=None):
        return Reminder.objects.create(
            wedding=self.wedding,
            kind='guest_rsvp',
            channel=channel,
            to_email=to_email,
            subject='RSVP reminder',
            message='Please RSVP.',
            scheduled_for=scheduled_for or (timezone.now() - timedelta(minutes=5)),
            status=status,
            claimed_at=claimed_at,
        )

    def test_due_reminder_is_sent_and_stamped(self):
        self.make_reminder()

        summary = send_due_reminders()

        self.assertEqual(summary['sent'], 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['guest@example.com'])
        self.assertEqual(mail.outbox[0].subject, 'RSVP reminder')

        reminder = Reminder.objects.get()
        self.assertEqual(reminder.status, 'sent')
        self.assertIsNotNone(reminder.sent_at)
        self.assertIsNone(reminder.claimed_at)

    def test_future_reminder_is_not_sent(self):
        self.make_reminder(scheduled_for=timezone.now() + timedelta(days=1))
        summary = send_due_reminders()
        self.assertEqual(summary['sent'], 0)
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(Reminder.objects.get().status, 'pending')

    def test_command_is_idempotent(self):
        """"Running delivery twice never double-sends the same row."""
        self.make_reminder()

        first = send_due_reminders()
        second = send_due_reminders()

        self.assertEqual(first['sent'], 1)
        self.assertEqual(second['sent'], 0)
        self.assertEqual(second['considered'], 0)
        self.assertEqual(len(mail.outbox), 1)

    def test_failure_marks_row_and_continues(self):
        """A row without a recipient is failed, not raised, and does not block others."""
        self.make_reminder(to_email='')
        self.make_reminder(to_email='other@example.com')

        summary = send_due_reminders()

        self.assertEqual(summary['sent'], 1)
        self.assertEqual(summary['failed'], 1)
        failed = Reminder.objects.get(to_email='')
        self.assertEqual(failed.status, 'failed')
        self.assertIn('ValueError', failed.error)
        self.assertEqual(len(mail.outbox), 1)

    def test_in_app_reminder_is_marked_sent_without_email(self):
        self.make_reminder(channel='in_app', to_email='')
        summary = send_due_reminders()
        self.assertEqual(summary['sent'], 1)
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(Reminder.objects.get().status, 'sent')

    def test_cancelled_reminder_is_not_sent(self):
        self.make_reminder(status='cancelled')
        summary = send_due_reminders()
        self.assertEqual(summary['sent'], 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_stale_claim_is_recovered_and_sent(self):
        """A row left in 'sending' by a crashed worker is retried."""
        self.make_reminder(
            status='sending',
            claimed_at=timezone.now() - timedelta(minutes=30),
        )

        summary = send_due_reminders()

        self.assertEqual(summary['sent'], 1)
        self.assertEqual(Reminder.objects.get().status, 'sent')

    def test_dry_run_sends_nothing(self):
        self.make_reminder()
        summary = send_due_reminders(dry_run=True)
        self.assertTrue(summary['dry_run'])
        self.assertEqual(summary['considered'], 1)
        self.assertEqual(summary['sent'], 0)
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(Reminder.objects.get().status, 'pending')

    def test_atomic_claim_ignores_rows_taken_by_another_worker(self):
        """A row another worker already moved to 'sending' is not sent twice."""
        reminder = self.make_reminder()
        Reminder.objects.filter(pk=reminder.pk).update(status='sending')

        summary = send_due_reminders()

        self.assertEqual(summary['sent'], 0)
        self.assertEqual(summary['claimed'], 0)
        self.assertEqual(Reminder.objects.get().status, 'sending')

    def test_celery_task_sends_due_reminders(self):
        """The Celery wrapper delivers through the same code path (eager mode)."""
        self.make_reminder()

        send_due_reminders_task.delay()

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(Reminder.objects.get().status, 'sent')


class SendDueRemindersCommandTests(ReminderDeliveryTestCase):
    """The management command: dry-run output and idempotency."""

    def run_command(self, *args):
        out = StringIO()
        call_command('send_due_reminders', *args, stdout=out)
        return out.getvalue()

    def test_dry_run_reports_without_sending(self):
        self.make_reminder()
        output = self.run_command('--dry-run')
        self.assertIn('would be sent', output)
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(Reminder.objects.get().status, 'pending')

    def test_run_sends_and_is_idempotent(self):
        self.make_reminder()

        first = self.run_command()
        second = self.run_command()

        self.assertIn('Sent 1 reminder(s)', first)
        self.assertIn('Sent 0 reminder(s)', second)
        self.assertEqual(len(mail.outbox), 1)


class ReminderApiTests(TestCase):
    """API surface: list, create, cancel, test-send, ownership."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='couple', email='couple@example.com', password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.other_user = User.objects.create_user(
            username='other', email='other@example.com', password='testpass123'
        )
        self.other_token = Token.objects.create(user=self.other_user)

        self.wedding = Wedding.objects.create(
            user=self.user,
            wedding_date=timezone.now().date() + timedelta(days=90),
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )
        self.other_wedding = Wedding.objects.create(
            user=self.other_user,
            wedding_date=timezone.now().date() + timedelta(days=60),
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )

    def make_reminder(self, wedding, **overrides):
        defaults = dict(
            wedding=wedding,
            kind='guest_rsvp',
            channel='email',
            to_email='guest@example.com',
            subject='Reminder',
            message='Body',
            scheduled_for=timezone.now() + timedelta(days=1),
        )
        defaults.update(overrides)
        return Reminder.objects.create(**defaults)

    def test_list_requires_authentication(self):
        response = APIClient().get('/api/notifications/reminders/')
        self.assertEqual(response.status_code, 401)

    def test_list_returns_only_own_wedding_reminders(self):
        self.make_reminder(self.wedding)
        self.make_reminder(self.other_wedding, to_email='stranger@example.com')

        response = self.client.get('/api/notifications/reminders/')

        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['to_email'], 'guest@example.com')
        self.assertEqual(data[0]['kind_display'], 'Guest RSVP reminder')

    def test_create_reminder_scopes_to_request_wedding(self):
        response = self.client.post('/api/notifications/reminders/', {
            'kind': 'payment_due',
            'channel': 'email',
            'to_email': 'vendor@example.com',
            'subject': 'Balance due',
            'message': 'Please pay.',
            'scheduled_for': (timezone.now() + timedelta(days=3)).isoformat(),
        })

        self.assertEqual(response.status_code, 201)
        reminder = Reminder.objects.get()
        self.assertEqual(reminder.wedding, self.wedding)
        self.assertEqual(reminder.status, 'pending')

    def test_create_email_reminder_requires_recipient(self):
        response = self.client.post('/api/notifications/reminders/', {
            'kind': 'custom',
            'channel': 'email',
            'subject': 'No recipient',
            'scheduled_for': (timezone.now() + timedelta(days=3)).isoformat(),
        })
        self.assertEqual(response.status_code, 400)

    def test_create_rejects_unknown_target_type(self):
        from django.contrib.contenttypes.models import ContentType

        auth_content_type = ContentType.objects.get(app_label='auth', model='permission')
        response = self.client.post('/api/notifications/reminders/', {
            'kind': 'custom',
            'channel': 'in_app',
            'target_type': auth_content_type.id,
            'target_id': 1,
            'scheduled_for': (timezone.now() + timedelta(days=3)).isoformat(),
        })
        self.assertEqual(response.status_code, 400)

    def test_cancel_pending_reminder(self):
        reminder = self.make_reminder(self.wedding)
        response = self.client.post(
            f'/api/notifications/reminders/{reminder.id}/cancel/'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['status'], 'cancelled')

    def test_cancel_sent_reminder_is_rejected(self):
        reminder = self.make_reminder(self.wedding, status='sent')
        response = self.client.post(
            f'/api/notifications/reminders/{reminder.id}/cancel/'
        )
        self.assertEqual(response.status_code, 400)

    def test_cannot_cancel_other_weddings_reminder(self):
        stranger = self.make_reminder(self.other_wedding)
        response = self.client.post(
            f'/api/notifications/reminders/{stranger.id}/cancel/'
        )
        self.assertEqual(response.status_code, 404)

    def test_test_send_delivers_to_current_user(self):
        response = self.client.post('/api/notifications/reminders/test_send/')

        self.assertEqual(response.status_code, 200)
        reminder = Reminder.objects.get()
        self.assertEqual(reminder.kind, 'test')
        self.assertEqual(reminder.to_email, 'couple@example.com')
        self.assertEqual(reminder.status, 'sent')
        self.assertEqual(len(mail.outbox), 1)
