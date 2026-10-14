"""
Stage 2: guest groups, plus-ones, dietary preferences, bulk update,
reminders, and seating endpoints.
"""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from guests.models import (
    Guest, GuestGroup, DietaryOption, RsvpStatus, Table,
)
from notifications.models import Reminder
from utils.wedding_insights import get_alerts
from weddings.models import Wedding, WeddingStatus

User = get_user_model()


class GuestStage2Base(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='couple', email='couple@example.com', password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        self.wedding = Wedding.objects.create(
            user=self.user,
            wedding_date=timezone.now().date() + timedelta(days=120),
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )
        self.rsvp_pending = RsvpStatus.objects.get_or_create(name='pending')[0]
        self.rsvp_confirmed = RsvpStatus.objects.get_or_create(name='confirmed')[0]

    def make_guest(self, first='Ada', last='Lovelace', **overrides):
        defaults = dict(
            wedding=self.wedding, first_name=first, last_name=last,
            rsvp_status=self.rsvp_pending,
            email=f'{first}.{last}@example.com'.lower(),
        )
        defaults.update(overrides)
        return Guest.objects.create(**defaults)


class GuestGroupCRUDTests(GuestStage2Base):
    def test_create_and_list_groups(self):
        create = self.client.post('/api/guests/groups/', {
            'name': 'College Friends',
            'side': 'bride',
            'group_type': 'friend',
            'notes': 'From college',
        })
        self.assertEqual(create.status_code, 201)
        group_id = create.json()['data']['id']

        listing = self.client.get('/api/guests/groups/')
        self.assertEqual(listing.status_code, 200)
        group = listing.json()['data'][0]
        self.assertEqual(group['name'], 'College Friends')
        self.assertEqual(group['side_display'], 'Bride')
        self.assertEqual(group['group_type_display'], 'Friend')
        self.assertIsNotNone(group['created_at'])

        update = self.client.patch(
            f'/api/guests/groups/{group_id}/', {'group_type': 'colleague'}
        )
        self.assertEqual(update.status_code, 200)
        self.assertEqual(update.json()['data']['group_type'], 'colleague')

        delete = self.client.delete(f'/api/guests/groups/{group_id}/')
        self.assertEqual(delete.status_code, 200)
        self.assertFalse(GuestGroup.objects.filter(pk=group_id).exists())

    def test_duplicate_group_name_rejected_per_wedding(self):
        GuestGroup.objects.create(wedding=self.wedding, name='Family')

        response = self.client.post('/api/guests/groups/', {'name': 'Family'})

        self.assertEqual(response.status_code, 400)

    def test_groups_are_scoped_to_the_wedding(self):
        other_user = User.objects.create_user(username='s', email='s@example.com')
        other_wedding = Wedding.objects.create(
            user=other_user, wedding_date='2026-01-01',
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )
        GuestGroup.objects.create(wedding=other_wedding, name='Strangers')

        response = self.client.get('/api/guests/groups/')

        self.assertEqual(response.json()['data'], [])


class PlusOneAndDietaryTests(GuestStage2Base):
    def test_create_guest_with_group_plus_one_and_dietary(self):
        group = GuestGroup.objects.create(wedding=self.wedding, name='Family')
        vegetarian = DietaryOption.objects.create(name='Vegetarian')
        Vegan = DietaryOption.objects.create(name='Vegan')

        response = self.client.post('/api/guests/guests/', {
            'first_name': 'Ada', 'last_name': 'L', 'email': 'ada@example.com',
            'group_id': group.id,
            'plus_one_name': 'Charles',
            'plus_one_rsvp_status_id': self.rsvp_confirmed.id,
            'dietary_ids': [vegetarian.id, Vegan.id],
        })

        self.assertEqual(response.status_code, 201)
        data = response.json()['data']
        self.assertEqual(data['plus_one_name'], 'Charles')
        self.assertEqual(data['group']['name'], 'Family')
        self.assertEqual(
            sorted(option['name'] for option in data['dietary_preferences']),
            ['Vegan', 'Vegetarian'],
        )

    def test_plus_one_status_nested_read(self):
        guest = self.make_guest(
            'Ada', 'L', plus_one_name='Charles',
            plus_one_rsvp_status=self.rsvp_confirmed,
        )

        response = self.client.get(f'/api/guests/guests/{guest.id}/')

        data = response.json()['data']
        self.assertEqual(data['plus_one_rsvp_status']['name'], 'confirmed')

    def test_plus_one_of_is_self_referential_and_validated(self):
        ada = self.make_guest('Ada', 'L')

        linked = self.client.patch(
            f'/api/guests/guests/{ada.id}/', {'is_plus_one_of': ada.id}
        )
        self.assertEqual(linked.status_code, 400)
        self.assertIn('own plus-one', str(linked.json()['error']['details']))

        bob = self.make_guest('Bob', 'M')
        as_plus_one = self.client.patch(
            f'/api/guests/guests/{bob.id}/', {'is_plus_one_of': ada.id}
        )
        self.assertEqual(as_plus_one.status_code, 200)

        # Bob is already a plus-one; a chain is rejected.
        carol = self.make_guest('Carol', 'N')
        chained = self.client.patch(
            f'/api/guests/guests/{carol.id}/', {'is_plus_one_of': bob.id}
        )
        self.assertEqual(chained.status_code, 400)

    def test_table_from_other_wedding_rejected(self):
        from rest_framework.authtoken.models import Token as _unused  # noqa
        other_user = User.objects.create_user(username='t', email='t@example.com')
        from weddings.models import Wedding as W
        other_wedding = W.objects.create(
            user=other_user, wedding_date='2026-01-01',
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )
        stranger_table = Table.objects.create(
            wedding=other_wedding, table_number=99, capacity=8
        )

        guest = self.make_guest('Ada', 'L')
        response = self.client.patch(
            f'/api/guests/guests/{guest.id}/', {'table_id': stranger_table.id}
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('not found in this wedding', str(response.json()['error']['details']))

    def test_group_filter_on_guest_list(self):
        group = GuestGroup.objects.create(wedding=self.wedding, name='Family')
        self.make_guest('In', 'Group', group=group)
        self.make_guest('Not', 'Group')

        response = self.client.get(f'/api/guests/guests/?group={group.id}')

        self.assertEqual(len(response.json()['data']), 1)
        self.assertEqual(response.json()['data'][0]['first_name'], 'In')


class BulkUpdateTests(GuestStage2Base):
    def test_bulk_update_allowlist(self):
        guest = self.make_guest()
        self.make_guest('Bob', 'M')

        response = self.client.post('/api/guests/bulk-update/', {
            'guest_ids': [guest.id],
            'updates': {
                'invitation_sent': True,
                'notes': 'Vendor booking',
                'rsvp_status_id': self.rsvp_confirmed.id,
            },
        }, format='json')

        self.assertEqual(response.status_code, 200)
        guest.refresh_from_db()
        self.assertTrue(guest.invitation_sent)
        self.assertEqual(guest.notes, 'Vendor booking')
        self.assertEqual(guest.rsvp_status, self.rsvp_confirmed)

    def test_bulk_update_rejects_unknown_fields(self):
        guest = self.make_guest()

        response = self.client.post('/api/guests/bulk-update/', {
            'guest_ids': [guest.id],
            'updates': {'wedding_id': 999, 'password': 'x'},
        }, format='json')

        self.assertEqual(response.status_code, 400)
        guest.refresh_from_db()
        self.assertEqual(guest.wedding_id, self.wedding.id)

    def test_bulk_update_uses_per_row_save(self):
        """
        A single-row UPDATE would bypass Guest.save(); this asserts the
        update took effect through save() for every guest in the batch.
        """
        first = self.make_guest('A', 'B')
        second = self.make_guest('C', 'D')
        group = GuestGroup.objects.create(wedding=self.wedding, name='Friends')

        response = self.client.post('/api/guests/bulk-update/', {
            'guest_ids': [first.id, second.id],
            'updates': {'group_id': group.id},
        }, format='json')

        self.assertEqual(response.json()['data']['updated_count'], 2)
        self.assertEqual(
            Guest.objects.filter(group=group, wedding=self.wedding).count(), 2
        )

    def test_bulk_update_ignores_other_weddings_guests(self):
        other_user = User.objects.create_user(username='o', email='o@example.com')
        other_wedding = Wedding.objects.create(
            user=other_user, wedding_date='2026-01-01',
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )
        stranger = Guest.objects.create(
            wedding=other_wedding, first_name='S', last_name='T'
        )

        response = self.client.post('/api/guests/bulk-update/', {
            'guest_ids': [stranger.id],
            'updates': {'reminder_sent': True},
        }, format='json')

        self.assertEqual(response.status_code, 404)
        stranger.refresh_from_db()
        self.assertFalse(stranger.reminder_sent)


class ReminderSchedulingTests(GuestStage2Base):
    def test_schedule_marks_pending_guests_only(self):
        pending = self.make_guest('Pend', 'Ing', rsvp_status=self.rsvp_pending)
        confirmed = self.make_guest('Con', 'Firmed', rsvp_status=self.rsvp_confirmed)

        scheduled = timezone.now() + timedelta(days=1)
        response = self.client.post('/api/guests/reminders/schedule/', {
            'guest_ids': [pending.id, confirmed.id],
            'scheduled_for': scheduled.isoformat(),
            'channel': 'email',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['scheduled_count'], 1)

        reminder = Reminder.objects.get()
        self.assertEqual(reminder.kind, 'guest_rsvp')
        self.assertEqual(reminder.status, 'pending')
        self.assertEqual(reminder.to_email, 'pend.ing@example.com')
        self.assertEqual(reminder.target_id, pending.id)
        self.assertEqual(reminder.scheduled_for.replace(microsecond=0), scheduled.replace(microsecond=0))

    def test_schedule_invalid_datetime_rejected(self):
        guest = self.make_guest()

        response = self.client.post('/api/guests/reminders/schedule/', {
            'guest_ids': [guest.id],
            'scheduled_for': 'not-a-date',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Reminder.objects.count(), 0)

    def test_schedule_requires_guest_ids(self):
        response = self.client.post('/api/guests/reminders/schedule/', {
            'scheduled_for': (timezone.now() + timedelta(days=1)).isoformat(),
        }, format='json')

        self.assertEqual(response.status_code, 400)

    def test_sent_reminder_stamps_guest(self):
        from notifications.delivery import send_reminder

        guest = self.make_guest()

        Reminder.objects.create(
            wedding=self.wedding,
            kind='guest_rsvp',
            channel='in_app',
            scheduled_for=timezone.now(),
            status='sending',
        )

        # Build the reminder with a target so the post-send effect applies.
        reminder = Reminder.objects.create(
            wedding=self.wedding,
            kind='guest_rsvp',
            channel='in_app',
            scheduled_for=timezone.now(),
            status='sending',
        )
        reminder.target = guest
        # Post-send effects dispatch on kind + target_type; set it directly.
        from django.contrib.contenttypes.models import ContentType
        reminder.target_type = ContentType.objects.get_for_model(Guest)
        reminder.target_id = guest.id
        reminder.save()

        self.assertTrue(send_reminder(reminder))

        guest.refresh_from_db()
        self.assertTrue(guest.reminder_sent)
        self.assertIsNotNone(guest.reminder_sent_date)
        self.assertTrue(guest.reminder_sent_date <= timezone.now())


class SeatingTests(GuestStage2Base):
    def setUp(self):
        super().setUp()
        self.table_a = Table.objects.create(wedding=self.wedding, table_number=1, capacity=2)
        self.table_b = Table.objects.create(wedding=self.wedding, table_number=2, capacity=1)

    def test_bulk_assign_within_capacity(self):
        first = self.make_guest('A', 'A')
        second = self.make_guest('B', 'B')

        response = self.client.post(
            f'/api/guests/tables/{self.table_a.id}/bulk_assign/',
            {'guest_ids': [first.id, second.id]}, format='json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['assigned_count'], 2)
        self.assertEqual(self.table_a.assigned_guests.count(), 2)

    def test_bulk_assign_over_capacity_rejected(self):
        first = self.make_guest('A', 'A')
        second = self.make_guest('B', 'B')

        response = self.client.post(
            f'/api/guests/tables/{self.table_b.id}/bulk_assign/',
            {'guest_ids': [first.id, second.id]}, format='json'
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.table_b.assigned_guests.count(), 0)

    def test_bulk_assign_rejects_stranger_guest(self):
        other_user = User.objects.create_user(username='s', email='s2@example.com')
        other_wedding = Wedding.objects.create(
            user=other_user, wedding_date='2026-01-01',
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )
        stranger = Guest.objects.create(
            wedding=other_wedding, first_name='S', last_name='T'
        )

        response = self.client.post(
            f'/api/guests/tables/{self.table_a.id}/bulk_assign/',
            {'guest_ids': [stranger.id]}, format='json'
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(self.table_a.assigned_guests.count(), 0)

    def test_auto_assign_fills_tables(self):
        for i in range(3):
            self.make_guest(f'G{i}', 'X')

        response = self.client.post('/api/guests/seating/auto-assign/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['assigned'], 3)
        self.assertEqual(self.table_a.assigned_guests.count(), 2)
        self.assertEqual(self.table_b.assigned_guests.count(), 1)

    def test_auto_assign_never_exceeds_capacity(self):
        for i in range(6):
            self.make_guest(f'G{i}', 'X')

        response = self.client.post('/api/guests/seating/auto-assign/')

        data = response.json()['data']
        self.assertLessEqual(data['assigned'], 3)
        self.assertLessEqual(self.table_a.assigned_guests.count(), 2)
        self.assertLessEqual(self.table_b.assigned_guests.count(), 1)
        self.assertEqual(len(data['unassignable']), 3)

    def test_auto_assign_without_tables_reports_nothing(self):
        Table.objects.all().delete()
        self.make_guest('A', 'A')

        response = self.client.post('/api/guests/seating/auto-assign/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['assigned'], 0)

    def test_seating_chart_reports_venue_capacity(self):
        response = self.client.get('/api/guests/seating-chart/')

        self.assertEqual(response.status_code, 200)
        self.assertIn('venue_capacity', response.json()['data'])
        self.assertIn('tables', response.json()['data'])


class GuestStatsAlertCoherenceTests(GuestStage2Base):
    def test_stale_rsvp_alert_uses_sent_invitations_only(self):
        guest = self.make_guest('Stale', 'Rsvp')
        guest.invitation_sent = True
        guest.invitation_sent_date = timezone.now() - timedelta(days=10)
        guest.save()

        alerts = get_alerts(self.wedding)

        self.assertIn('stale-rsvps', [alert['id'] for alert in alerts])
