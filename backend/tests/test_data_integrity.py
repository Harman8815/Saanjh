"""
Test cases for model-level data integrity: source tracking, RSVP timestamp
semantics, and completed_at consistency across bulk updates.
"""

from datetime import timedelta
from django.utils import timezone
from guests.models import Guest, RsvpStatus
from tasks.models import Task, TaskPriority, TaskStatus
from wedding_cards.models import (
    WeddingCard,
    WeddingCardAnalytics,
    WeddingCardGuest,
)
from .test_utils import APITestCase


class WeddingCardGuestSourceTestCase(APITestCase):
    """Track where a card RSVP came from."""

    def setUp(self):
        super().setUp()
        self.card = WeddingCard.objects.create(
            wedding=self.wedding, couple_names='Ada & Grace',
            wedding_details='Ceremony at noon',
        )

    def _external(self, **overrides):
        payload = dict(wedding_card=self.card, name='External Guest',
                       email='external@example.com')
        payload.update(overrides)
        return WeddingCardGuest.objects.create(**payload)

    def test_external_rsvp_is_tagged(self):
        """A guest with no link to the main list is marked external."""
        guest = self._external()
        self.assertEqual(guest.source, 'external')

    def test_linked_guest_is_tagged_main_list(self):
        """A guest linked to the main list is tagged for it."""
        rsvp_status = RsvpStatus.objects.get_or_create(name='pending')[0]
        main_guest = Guest.objects.create(
            wedding=self.wedding, first_name='Main', last_name='Guest',
            email='main@example.com', rsvp_status=rsvp_status,
        )
        card_guest = WeddingCardGuest.objects.create(
            wedding_card=self.card, name='Main Guest', guest=main_guest,
        )
        card_guest.refresh_from_db()
        self.assertEqual(card_guest.source, 'main_list')

    def test_linking_a_guest_updates_source(self):
        """Attaching a guest reclassifies the RSVP as coming from the list."""
        rsvp_status = RsvpStatus.objects.get_or_create(name='pending')[0]
        main_guest = Guest.objects.create(
            wedding=self.wedding, first_name='Late', last_name='Link',
            email='late@example.com', rsvp_status=rsvp_status,
        )
        card_guest = self._external()
        self.assertEqual(card_guest.source, 'external')

        card_guest.guest = main_guest
        card_guest.save()
        card_guest.refresh_from_db()
        self.assertEqual(card_guest.source, 'main_list')

    def test_unlinking_a_guest_reverts_source(self):
        """Detaching a guest makes the RSVP external again."""
        rsvp_status = RsvpStatus.objects.get_or_create(name='pending')[0]
        main_guest = Guest.objects.create(
            wedding=self.wedding, first_name='Temp', last_name='Link',
            email='temp@example.com', rsvp_status=rsvp_status,
        )
        card_guest = WeddingCardGuest.objects.create(
            wedding_card=self.card, name='Temp Link', guest=main_guest,
        )
        card_guest.guest = None
        card_guest.save()
        card_guest.refresh_from_db()
        self.assertEqual(card_guest.source, 'external')

    def test_source_is_exposed_via_api(self):
        """The source is readable through the card guest serializer."""
        self.authenticate()
        self._external()
        response = self.client.get(f'/api/wedding-cards/{self.card.id}/guests/')
        self.assertEqual(response.status_code, 200)
        results = response.json()['results']
        self.assertEqual(results[0]['source'], 'external')


class WeddingCardGuestRsvpDateTestCase(APITestCase):
    """rsvp_date must reflect the RSVP answer, not the last edit."""

    def setUp(self):
        super().setUp()
        self.card = WeddingCard.objects.create(
            wedding=self.wedding, couple_names='Ada & Grace',
            wedding_details='Ceremony at noon',
        )

    def test_pending_rsvp_has_no_date(self):
        """A guest who has not answered has no RSVP timestamp."""
        card_guest = WeddingCardGuest.objects.create(
            wedding_card=self.card, name='Pending Guest',
            email='pending@example.com', rsvp_status='pending',
        )
        self.assertIsNone(card_guest.rsvp_date)

    def test_answering_sets_the_date(self):
        """Confirming an RSVP stamps the date."""
        card_guest = WeddingCardGuest.objects.create(
            wedding_card=self.card, name='Answering Guest',
            email='answering@example.com', rsvp_status='pending',
        )
        card_guest.rsvp_status = 'confirmed'
        card_guest.save()
        card_guest.refresh_from_db()
        self.assertIsNotNone(card_guest.rsvp_date)

    def test_answering_at_creation_sets_the_date(self):
        """Creating a guest who already answered stamps the date."""
        card_guest = WeddingCardGuest.objects.create(
            wedding_card=self.card, name='Immediate Guest',
            email='immediate@example.com', rsvp_status='confirmed',
        )
        self.assertIsNotNone(card_guest.rsvp_date)

    def test_unrelated_edit_does_not_change_the_date(self):
        """Editing notes must not fabricate a new RSVP answer."""
        card_guest = WeddingCardGuest.objects.create(
            wedding_card=self.card, name='Noted Guest',
            email='noted@example.com', rsvp_status='confirmed',
        )
        original = card_guest.rsvp_date

        card_guest.notes = 'Updated dietary preferences'
        card_guest.dietary_restrictions = 'No shellfish'
        card_guest.save()
        card_guest.refresh_from_db()
        self.assertEqual(card_guest.rsvp_date, original)

    def test_changing_the_answer_refreshes_the_date(self):
        """Switching the answer updates the timestamp."""
        card_guest = WeddingCardGuest.objects.create(
            wedding_card=self.card, name='Switcher',
            email='switcher@example.com', rsvp_status='confirmed',
        )
        original = card_guest.rsvp_date

        card_guest.rsvp_status = 'declined'
        card_guest.save()
        card_guest.refresh_from_db()
        self.assertIsNotNone(card_guest.rsvp_date)
        self.assertGreaterEqual(card_guest.rsvp_date, original)

    def test_public_rsvp_sets_the_date(self):
        """The public endpoint stamps the answer time through the model."""
        card = WeddingCard.objects.create(
            wedding=self.wedding, couple_names='Public RSVP',
            wedding_details='Details', shareable_link='rsvp0001',
        )
        WeddingCardAnalytics.objects.create(wedding_card=card)
        response = self.client.post('/api/public/cards/rsvp0001/rsvp/', {
            'name': 'Public Guest', 'email': 'publicguest@example.com',
            'rsvp_status': 'confirmed',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        card_guest = WeddingCardGuest.objects.get(email='publicguest@example.com')
        self.assertIsNotNone(card_guest.rsvp_date)

    def test_public_rsvp_update_keeps_date_consistent(self):
        """Re-submitting an RSVP with the same answer keeps the date."""
        card = WeddingCard.objects.create(
            wedding=self.wedding, couple_names='Repeat RSVP',
            wedding_details='Details', shareable_link='rsvp0002',
        )
        WeddingCardAnalytics.objects.create(wedding_card=card)
        payload = {
            'name': 'Repeat Guest', 'email': 'repeatguest@example.com',
            'rsvp_status': 'confirmed',
        }
        self.client.post('/api/public/cards/rsvp0002/rsvp/', payload, format='json')
        card_guest = WeddingCardGuest.objects.get(email='repeatguest@example.com')
        original = card_guest.rsvp_date

        payload['notes'] = 'Looking forward to it'
        self.client.post('/api/public/cards/rsvp0002/rsvp/', payload, format='json')
        card_guest.refresh_from_db()
        self.assertEqual(card_guest.rsvp_date, original)


class TaskCompletedAtTestCase(APITestCase):
    """completed_at must track the status through every write path."""

    def setUp(self):
        super().setUp()

    def _task(self, **overrides):
        from tasks.models import TaskCategory
        status = TaskStatus.objects.get_or_create(name='todo')[0]
        priority = TaskPriority.objects.get_or_create(name='medium')[0]
        category = TaskCategory.objects.get_or_create(name='planning')[0]
        payload = dict(
            wedding=self.wedding, title='A task', status=status,
            priority=priority, category=category,
        )
        payload.update(overrides)
        return Task.objects.create(**payload)

    def test_completing_sets_completed_at_and_progress(self):
        """Marking a task complete stamps it and fills the progress."""
        task = self._task()
        completed = TaskStatus.objects.get_or_create(name='completed')[0]
        task.status = completed
        task.save()
        task.refresh_from_db()
        self.assertIsNotNone(task.completed_at)
        self.assertEqual(task.progress, 100)

    def test_reopening_clears_completed_at(self):
        """Returning a task to a non-completed status clears the stamp."""
        task = self._task()
        completed = TaskStatus.objects.get_or_create(name='completed')[0]
        todo = TaskStatus.objects.get_or_create(name='todo')[0]

        task.status = completed
        task.save()
        task.refresh_from_db()
        self.assertIsNotNone(task.completed_at)

        task.status = todo
        task.save()
        task.refresh_from_db()
        self.assertIsNone(task.completed_at)

    def test_bulk_complete_sets_completed_at(self):
        """A bulk update to completed still stamps the task."""
        task = self._task()
        completed = TaskStatus.objects.get_or_create(name='completed')[0]

        self.authenticate()
        response = self.client.post('/api/tasks/tasks/bulk_update/', {
            'task_ids': [task.id], 'updates': {'status': completed.id},
        }, format='json')
        self.assertEqual(response.status_code, 200)
        task.refresh_from_db()
        self.assertIsNotNone(task.completed_at)
        self.assertEqual(task.progress, 100)

    def test_bulk_reopen_clears_completed_at(self):
        """A bulk update away from completed clears the stamp."""
        completed = TaskStatus.objects.get_or_create(name='completed')[0]
        todo = TaskStatus.objects.get_or_create(name='todo')[0]
        task = self._task(status=completed)
        self.assertIsNotNone(task.completed_at)

        self.authenticate()
        response = self.client.post('/api/tasks/tasks/bulk_update/', {
            'task_ids': [task.id], 'updates': {'status': todo.id},
        }, format='json')
        self.assertEqual(response.status_code, 200)
        task.refresh_from_db()
        self.assertIsNone(task.completed_at)

    def test_bulk_update_reports_affected_count(self):
        """The bulk endpoint still reports how many rows changed."""
        first = self._task(title='First')
        second = self._task(title='Second')
        completed = TaskStatus.objects.get_or_create(name='completed')[0]

        self.authenticate()
        response = self.client.post('/api/tasks/tasks/bulk_update/', {
            'task_ids': [first.id, second.id], 'updates': {'status': completed.id},
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['updated_count'], 2)

    def test_bulk_update_ignores_other_weddings(self):
        """A bulk update cannot reach tasks outside the caller's wedding."""
        from django.contrib.auth import get_user_model
        from datetime import date, timedelta
        from weddings.models import Wedding, WeddingStatus

        User = get_user_model()
        User.objects.filter(username='bulkstranger').delete()
        stranger = User.objects.create_user(
            username='bulkstranger', email='bulkstranger@example.com',
            password='bulkstranger123',
        )
        wedding_status = WeddingStatus.objects.get_or_create(name='planning')[0]
        foreign_wedding = Wedding.objects.create(
            user=stranger, wedding_date=date.today() + timedelta(days=30),
            theme='Other', status=wedding_status,
        )
        foreign = self._task(wedding=foreign_wedding, title='Not yours')
        completed = TaskStatus.objects.get_or_create(name='completed')[0]

        self.authenticate()
        response = self.client.post('/api/tasks/tasks/bulk_update/', {
            'task_ids': [foreign.id], 'updates': {'status': completed.id},
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['updated_count'], 0)
        foreign.refresh_from_db()
        self.assertIsNone(foreign.completed_at)
        stranger.delete()


class IndexDeclarationTestCase(APITestCase):
    """Verify the composite indexes are declared on the models."""

    def test_wedding_scoped_models_declare_indexes(self):
        """Every high-traffic model has at least one wedding composite index."""
        checks = {
            Guest: ('wedding', 'rsvp_status'),
            Task: ('wedding', 'status'),
            WeddingCardGuest: ('wedding_card', 'rsvp_status'),
        }
        for model, expected in checks.items():
            composites = [
                tuple(index.fields) for index in model._meta.indexes
            ]
            self.assertIn(expected, composites,
                          f"{model.__name__} is missing index {expected}")

    def test_rsvp_status_is_indexed_on_card_guests(self):
        """The card guest status column carries a single-field index too."""
        field = WeddingCardGuest._meta.get_field('rsvp_status')
        self.assertTrue(field.db_index)

    def test_timeline_and_documents_have_wedding_indexes(self):
        """Timeline and document listings keep their ordered composites."""
        from timeline.models import TimelineEvent
        from documents.models import Document

        timeline_fields = [tuple(i.fields) for i in TimelineEvent._meta.indexes]
        document_fields = [tuple(i.fields) for i in Document._meta.indexes]
        self.assertIn(('timeline', 'date'), timeline_fields)
        self.assertIn(('wedding', 'uploaded_at'), document_fields)
