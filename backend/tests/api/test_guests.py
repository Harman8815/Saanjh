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
from tests.conftest import BaseTestCase


@pytest.mark.django_db
class TestRsvpStatusViewSet(BaseTestCase):
    """Test RSVP Status ViewSet endpoints."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
    
    def test_list_rsvp_statuses_success(self):
        """Test listing RSVP statuses."""
        RsvpStatusFactory.create_batch(3)
        
        response = self.client.get('/api/guests/rsvp-statuses/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "RSVP statuses retrieved successfully"
        assert len(response_data['data']) == 3
    
    def test_create_rsvp_status_success(self):
        """Test creating an RSVP status."""
        data = {
            'name': 'Confirmed',
            'description': 'Guest has confirmed attendance',
            'color': '#00FF00',
            'is_confirmed': True
        }
        
        response = self.client.post('/api/guests/rsvp-statuses/', data)
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "RSVP status created successfully"
        assert response_data['data']['name'] == 'Confirmed'
    
    def test_retrieve_rsvp_status_success(self):
        """Test retrieving a specific RSVP status."""
        rsvp_status = RsvpStatusFactory()
        
        response = self.client.get(f'/api/guests/rsvp-statuses/{rsvp_status.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "RSVP status retrieved successfully"
        assert response_data['data']['id'] == rsvp_status.id
    
    def test_update_rsvp_status_success(self):
        """Test updating an RSVP status."""
        rsvp_status = RsvpStatusFactory()
        data = {
            'name': 'Updated Status',
            'description': 'Updated description'
        }
        
        response = self.client.patch(f'/api/guests/rsvp-statuses/{rsvp_status.id}/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "RSVP status updated successfully"
        assert response_data['data']['name'] == 'Updated Status'
    
    def test_delete_rsvp_status_success(self):
        """Test deleting an RSVP status."""
        rsvp_status = RsvpStatusFactory()
        
        response = self.client.delete(f'/api/guests/rsvp-statuses/{rsvp_status.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "RSVP status deleted successfully"


@pytest.mark.django_db
class TestMealViewSet(BaseTestCase):
    """Test Meal ViewSet endpoints."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
    
    def test_list_meals_success(self):
        """Test listing meals."""
        MealFactory.create_batch(3)
        
        response = self.client.get('/api/guests/meals/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Meals retrieved successfully"
        assert len(response_data['data']) == 3
    
    def test_create_meal_success(self):
        """Test creating a meal."""
        data = {
            'name': 'Vegetarian Option',
            'description': 'Vegetarian meal option',
            'ingredients': ['vegetables', 'rice', 'tofu'],
            'is_vegetarian': True,
            'is_vegan': False,
            'price': '25.00'
        }
        
        response = self.client.post('/api/guests/meals/', data)
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "Meal created successfully"
        assert response_data['data']['name'] == 'Vegetarian Option'
    
    def test_retrieve_meal_success(self):
        """Test retrieving a specific meal."""
        meal = MealFactory()
        
        response = self.client.get(f'/api/guests/meals/{meal.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Meal retrieved successfully"
        assert response_data['data']['id'] == meal.id
    
    def test_update_meal_success(self):
        """Test updating a meal."""
        meal = MealFactory()
        data = {
            'name': 'Updated Meal',
            'price': '30.00'
        }
        
        response = self.client.patch(f'/api/guests/meals/{meal.id}/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Meal updated successfully"
        assert response_data['data']['name'] == 'Updated Meal'
    
    def test_delete_meal_success(self):
        """Test deleting a meal."""
        meal = MealFactory()
        
        response = self.client.delete(f'/api/guests/meals/{meal.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Meal deleted successfully"


@pytest.mark.django_db
class TestTableViewSet(BaseTestCase):
    """Test Table ViewSet endpoints."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
    
    def test_list_tables_success(self):
        """Test listing tables."""
        TableFactory.create_batch(3, wedding=self.wedding)
        
        response = self.client.get('/api/guests/tables/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Tables retrieved successfully"
        assert len(response_data['data']) == 3
    
    def test_create_table_success(self):
        """Test creating a table."""
        data = {
            'name': 'Table 1',
            'capacity': 8,
            'location': 'Main Hall',
            'shape': 'round',
            'notes': 'Near the window'
        }
        
        response = self.client.post('/api/guests/tables/', data)
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "Table created successfully"
        assert response_data['data']['name'] == 'Table 1'
        assert response_data['data']['capacity'] == 8
    
    def test_create_table_invalid_data(self):
        """Test creating table with invalid data."""
        data = {
            'name': '',
            'capacity': 'invalid_capacity'
        }
        
        response = self.client.post('/api/guests/tables/', data)
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
    
    def test_retrieve_table_success(self):
        """Test retrieving a specific table."""
        table = TableFactory(wedding=self.wedding)
        
        response = self.client.get(f'/api/guests/tables/{table.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Table retrieved successfully"
        assert response_data['data']['id'] == table.id
    
    def test_update_table_success(self):
        """Test updating a table."""
        table = TableFactory(wedding=self.wedding)
        data = {
            'name': 'Updated Table',
            'capacity': 10
        }
        
        response = self.client.patch(f'/api/guests/tables/{table.id}/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Table updated successfully"
        assert response_data['data']['name'] == 'Updated Table'
    
    def test_delete_table_success(self):
        """Test deleting a table."""
        table = TableFactory(wedding=self.wedding)
        
        response = self.client.delete(f'/api/guests/tables/{table.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Table deleted successfully"
    
    def test_assign_guest_success(self):
        """Test assigning a guest to a table."""
        table = TableFactory(wedding=self.wedding, capacity=8)
        guest = GuestFactory(wedding=self.wedding)
        
        data = {'guest_id': guest.id}
        response = self.client.post(f'/api/guests/tables/{table.id}/assign_guest/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Guest assigned to table successfully"
        
        # Verify assignment
        guest.refresh_from_db()
        assert guest.table.id == table.id
    
    def test_assign_guest_missing_id(self):
        """Test assigning guest without providing guest_id."""
        table = TableFactory(wedding=self.wedding)
        
        response = self.client.post(f'/api/guests/tables/{table.id}/assign_guest/', {})
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
        response_data = response.json()
        assert "Missing required field: guest_id" in response_data['errors'][0]
    
    def test_assign_guest_full_capacity(self):
        """Test assigning guest to a table at full capacity."""
        table = TableFactory(wedding=self.wedding, capacity=2)
        # Fill the table to capacity
        GuestFactory.create_batch(2, wedding=self.wedding, table=table)
        guest = GuestFactory(wedding=self.wedding)
        
        data = {'guest_id': guest.id}
        response = self.client.post(f'/api/guests/tables/{table.id}/assign_guest/', data)
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
        response_data = response.json()
        assert "Table is at full capacity" in response_data['errors'][0]
    
    def test_assign_guest_not_found(self):
        """Test assigning a guest that doesn't exist."""
        table = TableFactory(wedding=self.wedding)
        
        data = {'guest_id': 99999}
        response = self.client.post(f'/api/guests/tables/{table.id}/assign_guest/', data)
        
        self.assert_error_response(response, status.HTTP_404_NOT_FOUND)
        response_data = response.json()
        assert "Guest not found" in response_data['errors'][0]
    
    def test_other_user_table_inaccessible(self):
        """Test that user cannot access another user's tables."""
        other_user = UserFactory()
        other_wedding = WeddingFactory(user=other_user)
        other_table = TableFactory(wedding=other_wedding)
        
        response = self.client.get(f'/api/guests/tables/{other_table.id}/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
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
        
        response = self.client.post('/api/guests/guests/', data)
        
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
        
        response = self.client.post('/api/guests/guests/', data)
        
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
        
        response = self.client.patch(f'/api/guests/guests/{guest.id}/', data)
        
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
        
        response = self.client.post('/api/guests/guests/bulk_create/', data)
        
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
        
        response = self.client.post('/api/guests/guests/bulk_rsvp_update/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Updated 3 guests successfully"
        assert response_data['data']['updated_count'] == 3
    
    def test_bulk_rsvp_update_missing_fields(self):
        """Test bulk RSVP update with missing required fields."""
        data = {
            'guest_ids': [1, 2, 3]
        }
        
        response = self.client.post('/api/guests/guests/bulk_rsvp_update/', data)
        
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
        
        response = self.client.post('/api/guests/', data)
        
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
        
        response = self.client.patch(f'/api/guests/{self.guest.id}/', data)
        
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
        
        data = {
            'guest_ids': guest_ids,
            'rsvp_status': 'confirmed',
            'rsvp_date': timezone.now().date()
        }
        
        response = self.client.post('/api/guests/bulk-rsvp-update/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Updated 3 guests successfully"
        assert response_data['data']['updated_count'] == 3
    
    def test_bulk_rsvp_update_missing_fields(self):
        """Test bulk RSVP update with missing fields."""
        data = {
            'guest_ids': [1, 2, 3]
        }
        
        response = self.client.post('/api/guests/bulk-rsvp-update/', data)
        
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
        response = self.client.post('/api/guests/send-invitations/', data)
        
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
        self.confirmed_status = RsvpStatusFactory(name='confirmed', is_confirmed=True)
        self.pending_status = RsvpStatusFactory(name='pending', is_confirmed=False)
        
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
        """Test exporting guests without wedding."""
        self.wedding.delete()
        
        response = self.client.get('/api/guests/export/')
        
        self.assert_success_response(response)
        response_data = response.json()
        export_data = response_data['data']
        assert len(export_data) == 0


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
        assert all(guest['rsvp_status'] == self.status1.id for guest in guests)
    
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
        response_data = response.json()
        guests = response_data['data']
        assert len(guests) == 1
        assert 'John' in guests[0]['first_name']
    
    def test_ordering_by_name(self):
        """Test ordering guests by name."""
        response = self.client.get('/api/guests/guests/?ordering=first_name')
        
        self.assert_success_response(response)
        response_data = response.json()
        guests = response_data['data']
        # Verify ordering (should be ascending)
        names = [guest['first_name'] for guest in guests]
        assert names == sorted(names)
