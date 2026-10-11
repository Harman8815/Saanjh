"""
Test cases for role-based access control and public endpoint security.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from accounts.models import Role
from guests.models import RsvpStatus
from vendors.models import VendorStatus
from weddings.models import WeddingStatus, VenueCatalog
from wedding_cards.models import WeddingCard, WeddingCardGuest, WeddingCardAnalytics
from .test_utils import APITestCase

User = get_user_model()


class RBACPermissionTestCase(APITestCase):
    """Verify role-based permission classes are enforced on shared data."""

    def setUp(self):
        super().setUp()
        # The audit user is an ordinary (non-admin) user by default.

    def _make_admin(self):
        admin_role, _ = Role.objects.get_or_create(name='admin')
        self.user.role = admin_role
        self.user.save(update_fields=['role'])
        return admin_role

    # CATALOG / LOOKUP DATA
    def test_authenticated_user_can_read_catalog_data(self):
        """Ordinary users may read shared reference data."""
        self.authenticate()
        for url in ('/api/weddings/wedding-status/', '/api/guests/rsvp-status/',
                    '/api/vendors/vendor-status/', '/api/tasks/statuses/'):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 200, f"{url} -> {response.status_code}")

    def test_ordinary_user_cannot_create_wedding_status(self):
        """Non-admins must not create shared status data."""
        self.authenticate()
        response = self.client.post('/api/weddings/wedding-status/', {'name': 'hijacked'}, format='json')
        self.assert_error_response(response, 403, 'FORBIDDEN')

    def test_ordinary_user_cannot_create_venue_catalog(self):
        """Non-admins must not add global venue catalog entries."""
        self.authenticate()
        response = self.client.post('/api/weddings/venue-catalog/', {
            'name': 'Attacker Venue', 'type': 'garden', 'capacity_min': 1,
            'capacity_max': 10, 'price': '0.00'
        }, format='json')
        self.assert_error_response(response, 403, 'FORBIDDEN')

    def test_ordinary_user_cannot_create_role(self):
        """A non-admin must not be able to create or tamper with roles."""
        self.authenticate()
        response = self.client.post('/api/auth/roles/', {'name': 'superadmin'}, format='json')
        self.assert_error_response(response, 403, 'FORBIDDEN')
        self.assertFalse(Role.objects.filter(name='superadmin').exists())

    def test_ordinary_user_cannot_modify_role(self):
        """A non-admin must not be able to rename a role."""
        role = Role.objects.get_or_create(name='bride')[0]
        self.authenticate()
        response = self.client.patch(f'/api/auth/roles/{role.id}/', {'name': 'admin'}, format='json')
        self.assert_error_response(response, 403, 'FORBIDDEN')
        role.refresh_from_db()
        self.assertEqual(role.name, 'bride')

    def test_admin_can_create_catalog_data(self):
        """Admins retain write access to shared reference data."""
        self._make_admin()
        self.authenticate()
        response = self.client.post('/api/weddings/wedding-status/', {'name': 'reviewing'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(WeddingStatus.objects.filter(name='reviewing').exists())

    def test_ordinary_user_cannot_delete_lookup_row(self):
        """Deleting a shared lookup row is admin-only."""
        self.authenticate()
        status = VendorStatus.objects.get(name='pending')
        response = self.client.delete(f'/api/vendors/vendor-status/{status.id}/')
        self.assert_error_response(response, 403, 'FORBIDDEN')
        self.assertTrue(VendorStatus.objects.filter(id=status.id).exists())

    def test_roles_require_authentication(self):
        """Roles cannot be read without credentials."""
        self.unauthenticate()
        self.assert_unauthorized_response(self.client.get('/api/auth/roles/'))


class ObjectLevelPermissionTestCase(APITestCase):
    """Verify cross-user access is blocked on wedding-scoped resources."""

    def setUp(self):
        super().setUp()
        # Card owned by the primary user, whose guest list the other user
        # must not be able to read or modify.
        self.card = WeddingCard.objects.create(
            wedding=self.wedding,
            couple_names='Test Couple',
            wedding_details='Ceremony at noon',
        )
        self.card_guest = WeddingCardGuest.objects.create(
            wedding_card=self.card,
            name='Original Guest',
            email='original@example.com',
            rsvp_status='confirmed',
        )

    def test_guests_list_is_scoped_to_wedding(self):
        """A wedding card's guest list is only visible to its own wedding."""
        self.authenticate()
        response = self.client.get(f'/api/wedding-cards/{self.card.id}/guests/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)

    def test_other_user_cannot_read_card_guests(self):
        """Guests cannot be read through a card id belonging to another user."""
        self.authenticate_other_user()
        response = self.client.get(f'/api/wedding-cards/{self.card.id}/guests/')
        self.assert_not_found_response(response)

    def test_other_user_cannot_retrieve_card_guest(self):
        """A specific guest record is not readable across weddings."""
        self.authenticate_other_user()
        response = self.client.get(
            f'/api/wedding-cards/{self.card.id}/guests/{self.card_guest.id}/'
        )
        self.assert_not_found_response(response)

    def test_other_user_cannot_update_card_guest(self):
        """A guest RSVP cannot be modified across weddings."""
        self.authenticate_other_user()
        response = self.client.patch(
            f'/api/wedding-cards/{self.card.id}/guests/{self.card_guest.id}/',
            {'name': 'Hijacked'}, format='json'
        )
        self.assert_not_found_response(response)
        self.card_guest.refresh_from_db()
        self.assertEqual(self.card_guest.name, 'Original Guest')

    def test_other_user_cannot_create_card_guest(self):
        """Adding a guest to another wedding's card is rejected."""
        self.authenticate_other_user()
        response = self.client.post(
            f'/api/wedding-cards/{self.card.id}/guests/',
            {'name': 'Intruder', 'email': 'intruder@example.com'}, format='json'
        )
        self.assert_not_found_response(response)
        self.assertFalse(
            WeddingCardGuest.objects.filter(email='intruder@example.com').exists()
        )

    def test_wedding_list_is_scoped_to_owner(self):
        """The router-backed wedding list only returns the caller's weddings."""
        self.authenticate()
        response = self.client.get('/api/weddings/weddings/')
        self.assertEqual(response.status_code, 200)
        ids = [w['id'] for w in response.json()['data']]
        self.assertIn(self.wedding.id, ids)
        self.assertNotIn(self.other_wedding.id, ids)

    def test_other_user_cannot_retrieve_wedding(self):
        """A wedding owned by someone else is not retrievable."""
        self.authenticate_other_user()
        response = self.client.get(f'/api/weddings/weddings/{self.wedding.id}/')
        self.assert_not_found_response(response, 'Wedding')

    def test_other_user_cannot_update_wedding(self):
        """A wedding owned by someone else is not updatable."""
        self.authenticate_other_user()
        response = self.client.patch(
            f'/api/weddings/weddings/{self.wedding.id}/', {'theme': 'Hijacked'}, format='json'
        )
        self.assert_not_found_response(response, 'Wedding')
        self.wedding.refresh_from_db()
        self.assertNotEqual(self.wedding.theme, 'Hijacked')

    def test_other_user_cannot_read_guest_record(self):
        """A guest record belonging to another wedding is not readable."""
        self.authenticate_other_user()
        response = self.client.get(f'/api/guests/{self.guest.id}/')
        self.assert_not_found_response(response)

    def test_other_user_cannot_update_guest_record(self):
        """A guest record belonging to another wedding is not updatable."""
        self.authenticate_other_user()
        response = self.client.patch(
            f'/api/guests/{self.guest.id}/', {'first_name': 'Hijacked'}, format='json'
        )
        self.assert_not_found_response(response)
        self.guest.refresh_from_db()
        self.assertNotEqual(self.guest.first_name, 'Hijacked')

    def test_other_user_cannot_read_vendor(self):
        """A vendor belonging to another wedding is not readable."""
        self.authenticate_other_user()
        response = self.client.get(f'/api/vendors/{self.vendor.id}/')
        self.assert_not_found_response(response)


class PublicEndpointSecurityTestCase(APITestCase):
    """Verify public wedding card endpoints expose no private data."""

    def setUp(self):
        super().setUp()
        self.card = WeddingCard.objects.create(
            wedding=self.wedding,
            couple_names='Alice & Bob',
            wedding_details='Saturday, noon',
            shareable_link='abc12345',
        )
        WeddingCardAnalytics.objects.create(wedding_card=self.card)
        self.public_url = '/api/public/cards/abc12345/'
        self.rsvp_url = '/api/public/cards/abc12345/rsvp/'

    def test_public_card_is_readable_without_auth(self):
        """A shareable link exposes the card without credentials."""
        response = self.client.get(self.public_url)
        self.assert_success_response(response)
        data = response.json()['data']
        self.assertEqual(data['couple_names'], 'Alice & Bob')

    def test_public_card_does_not_leak_private_fields(self):
        """The public payload omits wedding/user identifiers and guest data."""
        response = self.client.get(self.public_url)
        data = response.json()['data']
        for field in ('wedding', 'user', 'guests', 'card_guests'):
            self.assertNotIn(field, data)
        # No attendee PII is attached to the public card.
        self.assertNotIn('guest', data)

    def test_public_card_increments_views(self):
        """Viewing the public card records a view."""
        self.client.get(self.public_url)
        analytics = WeddingCardAnalytics.objects.get(wedding_card=self.card)
        self.assertEqual(analytics.total_views, 1)

    def test_unknown_shareable_link_returns_404(self):
        """An invalid link is a not-found, not a server error."""
        response = self.client.get('/api/public/cards/doesnotexist/')
        self.assert_error_response(response, 404, 'NOT_FOUND')

    def test_public_rsvp_creates_guest(self):
        """A valid RSVP creates a guest record."""
        response = self.client.post(self.rsvp_url, {
            'name': 'Public Guest', 'email': 'public@example.com',
            'rsvp_status': 'confirmed',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            WeddingCardGuest.objects.filter(email='public@example.com').exists()
        )

    def test_public_rsvp_rejects_invalid_status(self):
        """rsvp_status must be one of the allowed values."""
        response = self.client.post(self.rsvp_url, {
            'name': 'Bad Status', 'email': 'bad@example.com',
            'rsvp_status': 'maybe',
        }, format='json')
        self.assert_validation_error_response(response, expected_fields=['rsvp_status'])
        self.assertFalse(
            WeddingCardGuest.objects.filter(email='bad@example.com').exists()
        )

    def test_public_rsvp_requires_name_and_email(self):
        """Name and email are mandatory."""
        response = self.client.post(self.rsvp_url, {'rsvp_status': 'pending'}, format='json')
        self.assert_validation_error_response(response, expected_fields=['name', 'email'])

    def test_public_rsvp_updates_existing_guest(self):
        """A repeat RSVP updates the existing record instead of duplicating."""
        self.client.post(self.rsvp_url, {
            'name': 'Repeat Guest', 'email': 'repeat@example.com',
            'rsvp_status': 'confirmed',
        }, format='json')
        second = self.client.post(self.rsvp_url, {
            'name': 'Repeat Guest', 'email': 'repeat@example.com',
            'rsvp_status': 'confirmed',
        }, format='json')
        self.assertEqual(second.status_code, 200)
        self.assertEqual(
            WeddingCardGuest.objects.filter(email='repeat@example.com').count(), 1
        )
        analytics = WeddingCardAnalytics.objects.get(wedding_card=self.card)
        self.assertEqual(analytics.total_rsvps, 1)

    def test_public_rsvp_keeps_status_counters_accurate(self):
        """Changing an RSVP updates per-status counters without double counting."""
        self.client.post(self.rsvp_url, {
            'name': 'Changer', 'email': 'changer@example.com',
            'rsvp_status': 'confirmed',
        }, format='json')
        self.client.post(self.rsvp_url, {
            'name': 'Changer', 'email': 'changer@example.com',
            'rsvp_status': 'declined',
        }, format='json')
        analytics = WeddingCardAnalytics.objects.get(wedding_card=self.card)
        self.assertEqual(analytics.total_rsvps, 1)
        self.assertEqual(analytics.confirmed_rsvps, 0)
        self.assertEqual(analytics.declined_rsvps, 1)

    def test_public_rsvp_unknown_card_returns_404(self):
        """RSVP to an unknown card is not-found."""
        response = self.client.post(
            '/api/public/cards/unknown/rsvp/',
            {'name': 'X', 'email': 'x@example.com', 'rsvp_status': 'pending'},
            format='json'
        )
        self.assert_error_response(response, 404, 'NOT_FOUND')

    def test_public_endpoints_do_not_expose_guest_list(self):
        """There is no unauthenticated route to a card's guest list."""
        response = self.client.get('/api/public/cards/abc12345/guests/')
        self.assertEqual(response.status_code, 404)
