"""
Stage 2: duplicate guest detection tests.

Scores by normalised email (1.0), phone (0.9), first+last name (0.8),
last name + address (0.6); clusters pair together; threshold is 0.8.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from guests.duplicates import (
    DUPLICATE_THRESHOLD,
    normalise_phone,
    score_pair,
    find_duplicate_clusters,
)
from guests.models import Guest, GuestGroup, RsvpStatus
from weddings.models import Wedding, WeddingStatus

User = get_user_model()


class DuplicateScoringTests(TestCase):
    """Unit tests for the scoring rules and normalisation."""

    def _guest(self, **kwargs):
        return Guest(**kwargs)

    def test_name_and_phone_matches_score_high(self):
        a = self._guest(first_name='Jane', last_name='Smith', phone='+91 555 123 4567')
        b = self._guest(first_name='Jane', last_name='Smith', phone='005551234567')

        score, reason = score_pair(a, b)
        self.assertEqual(score, 0.9)
        self.assertEqual(reason, 'phone')

    def test_email_is_a_perfect_match(self):
        a = self._guest(first_name='Jane', last_name='Smith', email='Jane.Smith@x.com')
        b = self._guest(first_name='J', last_name='Smith', email='jane.smith@x.com')

        score, reason = score_pair(a, b)
        self.assertEqual(score, 1.0)
        self.assertEqual(reason, 'email')

    def test_full_name_matches_at_threshold(self):
        a = self._guest(first_name='Jane', last_name='Smith')
        b = self._guest(first_name='jane', last_name='smith')

        score, reason = score_pair(a, b)
        self.assertEqual(score, 0.8)
        self.assertEqual(reason, 'name')

    def test_address_and_last_name_alone_scores_below_threshold(self):
        a = self._guest(first_name='Jane', last_name='Smith', address='1 Test Street')
        b = self._guest(first_name='Bob', last_name='Smith', address='1 test street')

        score, reason = score_pair(a, b)
        self.assertEqual(score, 0.6)
        self.assertEqual(reason, 'name+address')
        self.assertLess(score, DUPLICATE_THRESHOLD)

    def test_different_names_do_not_match(self):
        a = self._guest(first_name='Jane', last_name='Smith')
        b = self._guest(first_name='Ada', last_name='Lovelace')

        score, reason = score_pair(a, b)
        self.assertEqual(score, 0.0)
        self.assertIsNone(reason)

    def test_phone_normalisation(self):
        self.assertEqual(normalise_phone('+91 555 123 4567'), '5551234567')
        self.assertEqual(normalise_phone('(555) 123-4567'), '5551234567')
        self.assertEqual(normalise_phone('5551'), '5551')
        self.assertEqual(normalise_phone(''), '')


class DuplicateClusterTests(TestCase):
    """Clustering and API behaviour."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='couple', email='couple@example.com', password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        self.wedding = Wedding.objects.create(
            user=self.user,
            wedding_date='2026-06-01',
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )
        self.rsvp_pending = RsvpStatus.objects.get_or_create(name='pending')[0]

    def test_cluster_by_phone_and_email_bridges_two_guests(self):
        # Guest A shares a phone with B and an email with C, so the union of
        # both pairs puts A, B, C in one cluster.
        Guest.objects.create(
            wedding=self.wedding, first_name='Jane', last_name='Smith',
            phone='5551234567', email='jane@example.com',
        )
        Guest.objects.create(
            wedding=self.wedding, first_name='J', last_name='Smith',
            phone='+91 555 123 4567',
        )
        Guest.objects.create(
            wedding=self.wedding, first_name='Janie', last_name='Smith',
            email='jane@example.com',
        )

        response = self.client.get('/api/guests/duplicates/')

        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(data['cluster_count'], 1)
        cluster = data['clusters'][0]
        self.assertEqual(len(cluster['guests']), 3)
        self.assertTrue(cluster['match_score'] >= DUPLICATE_THRESHOLD)
        # The most complete record (the one with email + phone) is primary.
        self.assertEqual(cluster['reason'], 'email')

    def test_address_only_match_is_not_flagged(self):
        Guest.objects.create(
            wedding=self.wedding, first_name='Jane', last_name='Smith',
            address='1 Test Street',
        )
        Guest.objects.create(
            wedding=self.wedding, first_name='Bob', last_name='Smith',
            address='1 Test Street',
        )

        response = self.client.get('/api/guests/duplicates/')

        self.assertEqual(response.json()['data']['cluster_count'], 0)

    def test_unique_guests_produce_no_clusters(self):
        Guest.objects.create(
            wedding=self.wedding, first_name='Jane', last_name='Smith',
            email='jane@example.com',
        )
        Guest.objects.create(
            wedding=self.wedding, first_name='Ada', last_name='Lovelace',
            email='ada@example.com',
        )

        response = self.client.get('/api/guests/duplicates/')

        self.assertEqual(response.json()['data']['cluster_count'], 0)

    def test_duplicates_are_scoped_to_the_wedding(self):
        other_wedding_user = User.objects.create_user(
            username='stranger', email='stranger@example.com'
        )
        other_wedding = Wedding.objects.create(
            user=other_wedding_user,
            wedding_date='2026-05-01',
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )

        Guest.objects.create(
            wedding=self.wedding, first_name='Jane', last_name='Smith',
            email='jane@example.com', phone='5551234567',
        )
        Guest.objects.create(
            wedding=other_wedding, first_name='Jane', last_name='Smith',
            email='jane@example.com', phone='5551234567',
        )

        clusters = find_duplicate_clusters(self.wedding)

        self.assertEqual(len(clusters), 0)


class GuestGroupModelTests(TestCase):
    """Group model constraints and guest integration."""

    def setUp(self):
        self.user = User.objects.create_user(username='couple2', email='c2@example.com')
        self.wedding = Wedding.objects.create(
            user=self.user,
            wedding_date='2026-06-01',
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )

    def test_group_name_is_unique_per_wedding(self):
        GuestGroup.objects.create(wedding=self.wedding, name='Family')

        with self.assertRaises(Exception):
            GuestGroup.objects.create(wedding=self.wedding, name='Family')

    def test_group_is_set_null_when_deleted(self):
        group = GuestGroup.objects.create(wedding=self.wedding, name='Family')
        guest = Guest.objects.create(
            wedding=self.wedding, first_name='Kid', last_name='OfFamily',
            group=group,
        )

        group.delete()
        guest.refresh_from_db()

        self.assertIsNone(guest.group_id)
        self.assertTrue(Guest.objects.filter(pk=guest.pk).exists())

    def test_default_group_fields(self):
        group = GuestGroup.objects.create(wedding=self.wedding, name='Friends')

        self.assertEqual(group.group_type, 'family')
        self.assertEqual(group.side, 'both')
        self.assertEqual(group.guests.count(), 0)
