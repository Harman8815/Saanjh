"""
Comprehensive tests for the guests module API endpoints.
"""

import pytest
from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

from tests.factories import (
    UserFactory, WeddingFactory, GuestFactory, RsvpStatusFactory,
    TableFactory, MealFactory
)
from rest_framework.test import APIClient

from guests.models import Guest, Meal, Table, RsvpStatus
from tests.conftest import BaseTestCase


@pytest.mark.django_db
@pytest.mark.django_db
class TestRsvpStatusViewSet(BaseTestCase):
    """Test RSVP Status ViewSet endpoints.

    RSVP statuses are shared reference data, so writes require the admin role.
    """

    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)

    def test_list_rsvp_statuses_success(self):
        """Any authenticated user may read RSVP statuses."""
        RsvpStatusFactory.create_batch(3, name='pending')

        response = self.client.get('/api/guests/rsvp-status/')

        self.assert_success_response(response)
        assert response.json()['message'] == "RSVP statuses retrieved successfully"

    def test_create_rsvp_status_success(self):
        """An admin can create an RSVP status."""
        data = {'name': 'confirmed'}

        response = self.admin_client.post('/api/guests/rsvp-status/', data, format='json')

        self.assert_success_response(response, status.HTTP_201_CREATED)
        assert response.json()['data']['name'] == 'confirmed'
        assert RsvpStatus.objects.filter(name='confirmed').exists()

    def test_create_rsvp_status_duplicate_rejected(self):
        """RSVP status names are unique."""
        RsvpStatusFactory(name='confirmed')
        response = self.admin_client.post(
            '/api/guests/rsvp-status/', {'name': 'confirmed'}, format='json'
        )
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_rsvp_status_success(self):
        rsvp_status = RsvpStatusFactory(name='confirmed')

        response = self.client.get(f'/api/guests/rsvp-status/{rsvp_status.id}/')

        self.assert_success_response(response)
        assert response.json()['data']['id'] == rsvp_status.id

    def test_update_rsvp_status_success(self):
        rsvp_status = RsvpStatusFactory(name='pending')

        response = self.admin_client.patch(
            f'/api/guests/rsvp-status/{rsvp_status.id}/',
            {'name': 'confirmed'}, format='json'
        )

        self.assert_success_response(response)
        rsvp_status.refresh_from_db()
        assert rsvp_status.name == 'confirmed'

    def test_delete_rsvp_status_success(self):
        rsvp_status = RsvpStatusFactory(name='confirmed')

        response = self.admin_client.delete(f'/api/guests/rsvp-status/{rsvp_status.id}/')

        self.assert_success_response(response)
        assert not RsvpStatus.objects.filter(id=rsvp_status.id).exists()

    def test_create_rsvp_status_requires_admin(self):
        """A non-admin cannot create shared reference data."""
        response = self.client.post(
            '/api/guests/rsvp-status/', {'name': 'hijacked'}, format='json'
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert not RsvpStatus.objects.filter(name='hijacked').exists()

    def test_delete_rsvp_status_requires_admin(self):
        """A non-admin cannot delete shared reference data."""
        rsvp_status = RsvpStatusFactory(name='confirmed')
        response = self.client.delete(f'/api/guests/rsvp-status/{rsvp_status.id}/')
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert RsvpStatus.objects.filter(id=rsvp_status.id).exists()

    def test_list_rsvp_statuses_requires_authentication(self):
        """Reference data is not public."""
        client = APIClient()
        assert client.get('/api/guests/rsvp-status/').status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestMealViewSet(BaseTestCase):
    """Test Meal ViewSet endpoints (admin-write-only shared data)."""

    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)

    def test_list_meals_success(self):
        MealFactory.create_batch(3)

        response = self.client.get('/api/guests/meals/')

        self.assert_success_response(response)

    def test_create_meal_success(self):
        data = {'name': 'Vegetarian Option'}

        response = self.admin_client.post('/api/guests/meals/', data, format='json')

        self.assert_success_response(response, status.HTTP_201_CREATED)
        assert response.json()['data']['name'] == 'Vegetarian Option'

    def test_retrieve_meal_success(self):
        meal = MealFactory(name='Fish Course')

        response = self.client.get(f'/api/guests/meals/{meal.id}/')

        self.assert_success_response(response)
        assert response.json()['data']['id'] == meal.id

    def test_update_meal_success(self):
        meal = MealFactory(name='Beef Course')

        response = self.admin_client.patch(
            f'/api/guests/meals/{meal.id}/',
            {'name': 'Updated Meal'}, format='json'
        )

        self.assert_success_response(response)
        assert response.json()['data']['name'] == 'Updated Meal'

    def test_delete_meal_success(self):
        meal = MealFactory(name='Dessert')

        response = self.admin_client.delete(f'/api/guests/meals/{meal.id}/')

        self.assert_success_response(response)
        assert not Meal.objects.filter(id=meal.id).exists()

    def test_create_meal_requires_admin(self):
        response = self.client.post('/api/guests/meals/', {'name': 'Hijacked'}, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert not Meal.objects.filter(name='Hijacked').exists()


@pytest.mark.django_db
class TestTableViewSet(BaseTestCase):
    """Test Table ViewSet endpoints.

    Tables are wedding-scoped, not shared reference data, so the wedding owner
    manages them directly.
    """

    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)

    def test_list_tables_success(self):
        TableFactory.create_batch(3, wedding=self.wedding)

        response = self.client.get('/api/guests/tables/')

        self.assert_success_response(response)
        assert len(response.json()['data']) == 3

    def test_create_table_success(self):
        data = {'wedding': self.wedding.id, 'table_number': 1, 'capacity': 8}

        response = self.client.post('/api/guests/tables/', data, format='json')

        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()['data']
        assert response_data['table_number'] == 1
        assert response_data['capacity'] == 8

    def test_create_table_invalid_capacity(self):
        data = {'wedding': self.wedding.id, 'table_number': 2, 'capacity': 'not-a-number'}

        response = self.client.post('/api/guests/tables/', data, format='json')

        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)

    def test_create_table_missing_fields(self):
        response = self.client.post('/api/guests/tables/', {'wedding': self.wedding.id}, format='json')
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_table_success(self):
        table = TableFactory(wedding=self.wedding)

        response = self.client.get(f'/api/guests/tables/{table.id}/')

        self.assert_success_response(response)
        assert response.json()['data']['id'] == table.id

    def test_update_table_success(self):
        table = TableFactory(wedding=self.wedding)

        response = self.client.patch(
            f'/api/guests/tables/{table.id}/',
            {'capacity': 12}, format='json'
        )

        self.assert_success_response(response)
        table.refresh_from_db()
        assert table.capacity == 12

    def test_delete_table_success(self):
        table = TableFactory(wedding=self.wedding)

        response = self.client.delete(f'/api/guests/tables/{table.id}/')

        assert response.status_code in (status.HTTP_200_OK, status.HTTP_204_NO_CONTENT)
        assert not Table.objects.filter(id=table.id).exists()

    def test_duplicate_table_number_rejected(self):
        """table_number is unique per wedding."""
        TableFactory(wedding=self.wedding, table_number=1)

        response = self.client.post(
            '/api/guests/tables/',
            {'wedding': self.wedding.id, 'table_number': 1, 'capacity': 6},
            format='json'
        )

        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)

    def test_other_wedding_table_not_visible(self):
        """A table belonging to another wedding is not readable."""
        other_wedding = WeddingFactory()
        other_table = TableFactory(wedding=other_wedding)

        response = self.client.get(f'/api/guests/tables/{other_table.id}/')

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestGuestViewSet(BaseTestCase):
    """Test Guest ViewSet endpoints."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        self.rsvp_status = RsvpStatusFactory()
    
    def test_list_guests_success(self):
        """Test listing guests."""
        GuestFactory.create_batch(5, wedding=self.wedding)
        
        response = self.client.get('/api/guests/guests/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Guests retrieved successfully"
        assert len(response_data['data']) == 5
    
    def test_create_guest_success(self):
        """Test creating a guest."""
        data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'phone': '+1234567890',
            'relationship': 'family',
            'plus_one': False,
            'rsvp_status': self.rsvp_status.id
        }
        
        response = self.client.post('/api/guests/guests/', data, format='json')
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "Guest created successfully"
        assert response_data['data']['first_name'] == 'John'
        assert response_data['data']['last_name'] == 'Doe'
    
    def test_create_guest_invalid_data(self):
        """Test creating guest with invalid data."""
        data = {
            'first_name': '',
            'email': 'invalid-email'
        }
        
        response = self.client.post('/api/guests/guests/', data, format='json')
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
    
    def test_retrieve_guest_success(self):
        """Test retrieving a specific guest."""
        guest = GuestFactory(wedding=self.wedding)
        
        response = self.client.get(f'/api/guests/guests/{guest.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Guest retrieved successfully"
        assert response_data['data']['id'] == guest.id
    
    def test_update_guest_success(self):
        """Test updating a guest."""
        guest = GuestFactory(wedding=self.wedding)
        data = {
            'first_name': 'Updated',
            'email': 'updated@example.com'
        }
        
        response = self.client.patch(f'/api/guests/guests/{guest.id}/', data, format='json')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Guest updated successfully"
        assert response_data['data']['first_name'] == 'Updated'
    
    def test_delete_guest_success(self):
        """Test deleting a guest."""
        guest = GuestFactory(wedding=self.wedding)
        
        response = self.client.delete(f'/api/guests/guests/{guest.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Guest deleted successfully"
    
    def test_bulk_create_guests_success(self):
        """Test bulk creating guests."""
        data = {
            'guests': [
                {
                    'first_name': 'Guest',
                    'last_name': 'One',
                    'email': 'guest1@example.com',
                    'relationship': 'family'
                },
                {
                    'first_name': 'Guest',
                    'last_name': 'Two',
                    'email': 'guest2@example.com',
                    'relationship': 'friend'
                }
            ]
        }
        
        response = self.client.post('/api/guests/guests/bulk_create/', data, format='json')
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "Guests created successfully"
        assert len(response_data['data']) == 2
    
    def test_bulk_rsvp_update_success(self):
        """Test bulk RSVP update action."""
        guests = GuestFactory.create_batch(3, wedding=self.wedding)
        guest_ids = [guest.id for guest in guests]
        new_status = RsvpStatusFactory()
        
        data = {
            'guest_ids': guest_ids,
            'rsvp_status_id': new_status.id,
            'rsvp_date': timezone.now().date()
        }
        
        response = self.client.post('/api/guests/guests/bulk_rsvp_update/', data, format='json')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Updated 3 guests successfully"
        assert response_data['data']['updated_count'] == 3
    
    def test_bulk_rsvp_update_missing_fields(self):
        """Test bulk RSVP update with missing required fields."""
        data = {
            'guest_ids': [1, 2, 3]
        }
        
        response = self.client.post('/api/guests/guests/bulk_rsvp_update/', data, format='json')
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
        response_data = response.json()
        assert "Missing required fields" in response_data['errors'][0]
    
    def test_other_user_guest_inaccessible(self):
        """Test that user cannot access another user's guests."""
        other_user = UserFactory()
        other_wedding = WeddingFactory(user=other_user)
        other_guest = GuestFactory(wedding=other_wedding)
        
        response = self.client.get(f'/api/guests/guests/{other_guest.id}/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestGuestListCreateView(BaseTestCase):
    """Test legacy guest list and create endpoints."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
    
    def test_list_guests_legacy_success(self):
        """Test listing guests through legacy endpoint."""
        GuestFactory.create_batch(3, wedding=self.wedding)
        
        response = self.client.get('/api/guests/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Guests retrieved successfully"
        assert len(response_data['data']) == 3
    
    def test_create_guest_legacy_success(self):
        """Test creating guest through legacy endpoint."""
        data = {
            'first_name': 'Legacy',
            'last_name': 'Guest',
            'email': 'legacy@example.com'
        }
        
        response = self.client.post('/api/guests/', data, format='json')
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "Guest created successfully"
        assert response_data['data']['first_name'] == 'Legacy'


@pytest.mark.django_db
class TestGuestDetailView(BaseTestCase):
    """Test legacy guest detail endpoints."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        self.guest = GuestFactory(wedding=self.wedding)
    
    def test_retrieve_guest_legacy_success(self):
        """Test retrieving guest through legacy endpoint."""
        response = self.client.get(f'/api/guests/{self.guest.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Guest retrieved successfully"
        assert response_data['data']['id'] == self.guest.id
    
    def test_update_guest_legacy_success(self):
        """Test updating guest through legacy endpoint."""
        data = {
            'first_name': 'Updated Legacy'
        }
        
        response = self.client.patch(f'/api/guests/{self.guest.id}/', data, format='json')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Guest updated successfully"
        assert response_data['data']['first_name'] == 'Updated Legacy'
    
    def test_delete_guest_legacy_success(self):
        """Test deleting guest through legacy endpoint."""
        response = self.client.delete(f'/api/guests/{self.guest.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Guest deleted successfully"


@pytest.mark.django_db
class TestGuestBulkRsvpUpdate(BaseTestCase):
    """Test guest bulk RSVP update endpoint."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        self.guests = GuestFactory.create_batch(3, wedding=self.wedding)
    
    def test_bulk_rsvp_update_success(self):
        """Test bulk RSVP update endpoint."""
        guest_ids = [guest.id for guest in self.guests]
        new_status = RsvpStatusFactory(name='confirmed')
        
        data = {
            'guest_ids': guest_ids,
            'rsvp_status_id': new_status.id,
            'rsvp_date': timezone.now().date()
        }
        
        response = self.client.post('/api/guests/guests/bulk_rsvp_update/', data, format='json')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['data']['updated_count'] == 3
    
    def test_bulk_rsvp_update_missing_fields(self):
        """Test bulk RSVP update with missing fields."""
        data = {
            'guest_ids': [1, 2, 3]
        }
        
        response = self.client.post('/api/guests/bulk-rsvp-update/', data, format='json')
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)


@pytest.mark.django_db
class TestGuestSendInvitations(BaseTestCase):
    """Test guest send invitations endpoint."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        self.guests = GuestFactory.create_batch(3, wedding=self.wedding)
    
    def test_send_invitations_success(self):
        """Test sending invitations to guests."""
        guest_ids = [guest.id for guest in self.guests]
        
        data = {'guest_ids': guest_ids}
        response = self.client.post('/api/guests/send-invitations/', data, format='json')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Marked 3 invitations as sent successfully"
        assert response_data['data']['updated_count'] == 3
    
    def test_send_invitations_missing_ids(self):
        """Test sending invitations without guest IDs."""
        response = self.client.post('/api/guests/send-invitations/', {})
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)


@pytest.mark.django_db
class TestGuestStatistics(BaseTestCase):
    """Test guest statistics endpoint."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        self.confirmed_status = RsvpStatusFactory(name='confirmed')
        self.pending_status = RsvpStatusFactory(name='pending')
        
        # Create guests with different RSVP statuses
        GuestFactory.create_batch(3, wedding=self.wedding, rsvp_status=self.confirmed_status)
        GuestFactory.create_batch(2, wedding=self.wedding, rsvp_status=self.pending_status)
    
    def test_get_guest_statistics_success(self):
        """Test getting guest statistics."""
        response = self.client.get('/api/guests/statistics/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Statistics retrieved successfully"
        stats = response_data['data']
        assert 'total' in stats
        assert 'confirmed' in stats
        assert 'pending' in stats
        assert 'rsvp_rate' in stats
        assert 'expected_attendees' in stats
        assert stats['total'] == 5
        assert stats['confirmed'] == 3
        assert stats['pending'] == 2
    
    def test_get_guest_statistics_no_wedding(self):
        """Test getting statistics without wedding."""
        self.wedding.delete()
        
        response = self.client.get('/api/guests/statistics/')
        
        self.assert_success_response(response)
        response_data = response.json()
        stats = response_data['data']
        assert stats['total'] == 0
        assert stats['confirmed'] == 0


@pytest.mark.django_db
class TestGuestExport(BaseTestCase):
    """Test guest export endpoint."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        GuestFactory.create_batch(3, wedding=self.wedding)
    
    def test_export_guests_success(self):
        """Test exporting guest data."""
        response = self.client.get('/api/guests/export/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Guest data exported successfully"
        export_data = response_data['data']
        assert len(export_data) == 3
        assert 'name' in export_data[0]
        assert 'email' in export_data[0]
        assert 'phone' in export_data[0]
    
    def test_export_guests_no_wedding(self):
        """Exporting without a wedding is a clean 404, not a 500."""
        self.wedding.delete()
        
        response = self.client.get('/api/guests/export/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()['error']['code'] == 'NOT_FOUND'


@pytest.mark.django_db
class TestSeatingChart(BaseTestCase):
    """Test seating chart endpoint."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        self.table = TableFactory(wedding=self.wedding, capacity=4)
        self.guests = GuestFactory.create_batch(2, wedding=self.wedding, table=self.table)
        self.unassigned_guests = GuestFactory.create_batch(2, wedding=self.wedding)
    
    def test_get_seating_chart_success(self):
        """Test getting seating chart data."""
        response = self.client.get('/api/guests/seating-chart/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Seating chart retrieved successfully"
        chart_data = response_data['data']
        assert 'tables' in chart_data
        assert 'unassigned_guests' in chart_data
        assert len(chart_data['tables']) == 1
        assert len(chart_data['unassigned_guests']) == 2
    
    def test_get_seating_chart_no_wedding(self):
        """Test getting seating chart without wedding."""
        self.wedding.delete()
        
        response = self.client.get('/api/guests/seating-chart/')
        
        self.assert_success_response(response)
        response_data = response.json()
        chart_data = response_data['data']
        assert chart_data['tables'] == []
        assert chart_data['unassigned_guests'] == []


@pytest.mark.django_db
class TestGuestFiltering(BaseTestCase):
    """Test guest filtering and search functionality."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        self.status1 = RsvpStatusFactory(name='Confirmed')
        self.status2 = RsvpStatusFactory(name='Pending')
        
        # Create guests with different attributes
        GuestFactory(
            wedding=self.wedding,
            first_name='John',
            last_name='Smith',
            rsvp_status=self.status1,
            relationship='family'
        )
        GuestFactory(
            wedding=self.wedding,
            first_name='Jane',
            last_name='Doe',
            rsvp_status=self.status2,
            relationship='friend'
        )
        GuestFactory(
            wedding=self.wedding,
            first_name='Bob',
            last_name='Johnson',
            rsvp_status=self.status1,
            relationship='family'
        )
    
    def test_filter_by_rsvp_status(self):
        """Test filtering guests by RSVP status."""
        response = self.client.get(f'/api/guests/guests/?rsvp_status={self.status1.id}')
        
        self.assert_success_response(response)
        response_data = response.json()
        guests = response_data['data']
        assert len(guests) == 2
        assert all(guest['rsvp_status']['id'] == self.status1.id for guest in guests)
    
    def test_filter_by_relationship(self):
        """Test filtering guests by relationship."""
        response = self.client.get('/api/guests/guests/?relationship=family')
        
        self.assert_success_response(response)
        response_data = response.json()
        guests = response_data['data']
        assert len(guests) == 2
        assert all(guest['relationship'] == 'family' for guest in guests)
    
    def test_search_by_name(self):
        """Test searching guests by name."""
        response = self.client.get('/api/guests/guests/?search=John')
        
        self.assert_success_response(response)
        guests = response.json()['data']
        assert len(guests) >= 1
        assert any('John' in guest['first_name'] for guest in guests)
    
    def test_ordering_by_name(self):
        """Test ordering guests by name."""
        response = self.client.get('/api/guests/guests/?ordering=first_name')
        
        self.assert_success_response(response)
        response_data = response.json()
        guests = response_data['data']
        # Verify ordering (should be ascending)
        names = [guest['first_name'] for guest in guests]
        assert names == sorted(names)
