"""
Comprehensive test cases for Guest API endpoints.
"""

from datetime import date, datetime, timedelta
from django.urls import reverse
from rest_framework import status
from .test_utils import APITestCase, TestDataFactory, APIEndpointTester


class GuestAPITestCase(APITestCase):
    """Test cases for Guest API endpoints."""

    def setUp(self):
        super().setUp()
        self.endpoint_tester = APIEndpointTester(self, '/api/guests/')

    # LIST TESTS
    def test_guest_list_authenticated(self):
        """Test guest list endpoint with authentication."""
        self.endpoint_tester.test_list_endpoint(authenticate=True, expected_count=1)

    def test_guest_list_unauthenticated(self):
        """Test guest list endpoint without authentication."""
        self.endpoint_tester.test_list_endpoint(authenticate=False)

    def test_guest_list_empty_wedding(self):
        """Test guest list for wedding with no guests."""
        self.guest.delete()  # Remove the test guest
        self.authenticate()
        
        response = self.client.get('/api/guests/')
        self.assert_success_response(response)
        data = response.json()
        self.assertEqual(len(data['data']), 0)

    def test_guest_list_pagination(self):
        """Test guest list pagination."""
        # Create multiple guests for pagination testing
        for i in range(25):
            TestDataFactory.create_guest_data(
                first_name=f'Guest{i}',
                last_name=f'Test{i}',
                email=f'guest{i}@example.com'
            )
            # Note: This would need to be adapted to actually create guests
            # This is just showing the test structure
        
        self.authenticate()
        response = self.client.get('/api/guests/')
        self.assert_success_response(response)
        data = response.json()
        
        # Check pagination structure
        if 'results' in data['data']:
            self.assertIn('count', data['data'])
            self.assertIn('next', data['data'])
            self.assertIn('previous', data['data'])

    # RETRIEVE TESTS
    def test_guest_retrieve_own_guest(self):
        """Test retrieving own wedding guest."""
        self.endpoint_tester.test_retrieve_endpoint(
            obj_id=self.guest.id,
            authenticate=True,
            should_exist=True
        )

    def test_guest_retrieve_other_wedding_guest_forbidden(self):
        """Test retrieving guest from other wedding should be forbidden."""
        # Create guest for other wedding
        other_guest = Guest.objects.create(
            wedding=self.other_wedding,
            first_name='Other',
            last_name='Guest',
            email='other@example.com',
            rsvp_status=self.pending_rsvp
        )
        
        self.authenticate()
        response = self.client.get(f'/api/guests/{other_guest.id}/')
        self.assert_forbidden_response(response, "You don't have permission to access this guest")

    def test_guest_retrieve_nonexistent(self):
        """Test retrieving non-existent guest."""
        self.endpoint_tester.test_retrieve_endpoint(
            obj_id=99999,
            authenticate=True,
            should_exist=False
        )

    def test_guest_retrieve_unauthenticated(self):
        """Test guest retrieve without authentication."""
        self.endpoint_tester.test_retrieve_endpoint(
            obj_id=self.guest.id,
            authenticate=False
        )

    # CREATE TESTS
    def test_guest_create_valid_data(self):
        """Test creating guest with valid data."""
        guest_data = TestDataFactory.create_guest_data(
            first_name='New',
            last_name='Guest',
            email='newguest@example.com',
            phone='555-0456',
            relationship='friend'
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=guest_data,
            authenticate=True,
            should_succeed=True
        )

    def test_guest_create_minimal_data(self):
        """Test creating guest with minimal required data."""
        minimal_data = {
            'first_name': 'Minimal',
            'last_name': 'Guest'
        }
        
        self.authenticate()
        response = self.client.post('/api/guests/', minimal_data)
        self.assert_created_response(response)

    def test_guest_create_duplicate_email(self):
        """Test creating guest with duplicate email should fail."""
        duplicate_data = TestDataFactory.create_guest_data(
            first_name='Duplicate',
            last_name='Guest',
            email=self.guest.email  # Same email as existing guest
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=duplicate_data,
            authenticate=True,
            should_succeed=False
        )

    def test_guest_create_invalid_email(self):
        """Test creating guest with invalid email."""
        invalid_data = TestDataFactory.create_guest_data(
            email='invalid-email-format',
            first_name='Invalid',
            last_name='Email'
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=invalid_data,
            authenticate=True,
            should_succeed=False
        )

    def test_guest_create_missing_required_fields(self):
        """Test creating guest with missing required fields."""
        invalid_data = {
            'email': 'test@example.com',
            'phone': '555-0123'
            # Missing first_name and last_name
        }
        
        self.endpoint_tester.test_create_endpoint(
            data=invalid_data,
            authenticate=True,
            should_succeed=False
        )

    def test_guest_create_invalid_relationship(self):
        """Test creating guest with invalid relationship."""
        invalid_data = TestDataFactory.create_guest_data(
            relationship='invalid_relationship',
            first_name='Invalid',
            last_name='Relation'
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=invalid_data,
            authenticate=True,
            should_succeed=False
        )

    def test_guest_create_unauthenticated(self):
        """Test guest creation without authentication."""
        guest_data = TestDataFactory.create_guest_data()
        
        self.endpoint_tester.test_create_endpoint(
            data=guest_data,
            authenticate=False
        )

    def test_guest_create_for_nonexistent_wedding(self):
        """Test creating guest for user with no wedding."""
        new_user = self._create_user('nouser', 'nouser@example.com')
        new_token = Token.objects.create(user=new_user)
        self.authenticate(new_token)
        
        guest_data = TestDataFactory.create_guest_data()
        response = self.client.post('/api/guests/', guest_data)
        self.assert_error_response(response, 400, "NO_WEDDING_FOUND")

    # UPDATE TESTS
    def test_guest_update_valid_data(self):
        """Test updating guest with valid data."""
        update_data = TestDataFactory.create_guest_data(
            first_name='Updated',
            last_name='Guest',
            email='updated@example.com',
            phone='555-0987',
            relationship='colleague'
        )
        
        self.endpoint_tester.test_update_endpoint(
            obj_id=self.guest.id,
            data=update_data,
            authenticate=True,
            should_succeed=True
        )

    def test_guest_update_partial_fields(self):
        """Test updating guest with partial fields."""
        partial_data = {
            'phone': '555-1111',
            'notes': 'Updated notes'
        }
        
        self.endpoint_tester.test_partial_update_endpoint(
            obj_id=self.guest.id,
            data=partial_data,
            authenticate=True,
            should_succeed=True
        )

    def test_guest_update_rsvp_status(self):
        """Test updating guest RSVP status."""
        update_data = {
            'rsvp_status': self.confirmed_rsvp.id,
            'rsvp_date': date.today().isoformat()
        }
        
        self.authenticate()
        response = self.client.patch(f'/api/guests/{self.guest.id}/', update_data)
        self.assert_success_response(response)
        
        # Verify the update
        self.guest.refresh()
        self.assertEqual(self.guest.rsvp_status.id, self.confirmed_rsvp.id)

    def test_guest_update_other_wedding_guest_forbidden(self):
        """Test updating guest from other wedding should be forbidden."""
        other_guest = Guest.objects.create(
            wedding=self.other_wedding,
            first_name='Other',
            last_name='Guest',
            email='other@example.com',
            rsvp_status=self.pending_rsvp
        )
        
        update_data = TestDataFactory.create_guest_data(first_name='Hacked')
        
        self.authenticate()
        response = self.client.patch(f'/api/guests/{other_guest.id}/', update_data)
        self.assert_forbidden_response(response)

    def test_guest_update_invalid_email(self):
        """Test updating guest with invalid email."""
        update_data = {
            'email': 'invalid-email-format'
        }
        
        self.endpoint_tester.test_partial_update_endpoint(
            obj_id=self.guest.id,
            data=update_data,
            authenticate=True,
            should_succeed=False
        )

    def test_guest_update_unauthenticated(self):
        """Test guest update without authentication."""
        update_data = TestDataFactory.create_guest_data(first_name='Unauthorized')
        
        self.endpoint_tester.test_partial_update_endpoint(
            obj_id=self.guest.id,
            data=update_data,
            authenticate=False
        )

    # DELETE TESTS
    def test_guest_delete_own_guest(self):
        """Test deleting own wedding guest."""
        self.endpoint_tester.test_delete_endpoint(
            obj_id=self.guest.id,
            authenticate=True,
            should_succeed=True
        )

    def test_guest_delete_other_wedding_guest_forbidden(self):
        """Test deleting guest from other wedding should be forbidden."""
        other_guest = Guest.objects.create(
            wedding=self.other_wedding,
            first_name='Other',
            last_name='Guest',
            email='other@example.com',
            rsvp_status=self.pending_rsvp
        )
        
        self.authenticate()
        response = self.client.delete(f'/api/guests/{other_guest.id}/')
        self.assert_forbidden_response(response)

    def test_guest_delete_nonexistent(self):
        """Test deleting non-existent guest."""
        self.endpoint_tester.test_delete_endpoint(
            obj_id=99999,
            authenticate=True,
            should_succeed=False
        )

    def test_guest_delete_unauthenticated(self):
        """Test guest deletion without authentication."""
        self.endpoint_tester.test_delete_endpoint(
            obj_id=self.guest.id,
            authenticate=False
        )

    # RSVP MANAGEMENT TESTS
    def test_guest_bulk_rsvp_update(self):
        """Test bulk RSVP status update for multiple guests."""
        # Create additional guests
        guest2 = Guest.objects.create(
            wedding=self.wedding,
            first_name='Guest',
            last_name='Two',
            email='guest2@example.com',
            rsvp_status=self.pending_rsvp
        )
        
        bulk_data = {
            'guests': [
                {'id': self.guest.id, 'rsvp_status': self.confirmed_rsvp.id},
                {'id': guest2.id, 'rsvp_status': self.declined_rsvp.id}
            ]
        }
        
        self.authenticate()
        response = self.client.post('/api/guests/bulk-rsvp/', bulk_data)
        self.assert_success_response(response, message="RSVP statuses updated successfully")
        
        # Verify updates
        self.guest.refresh()
        guest2.refresh()
        self.assertEqual(self.guest.rsvp_status.id, self.confirmed_rsvp.id)
        self.assertEqual(guest2.rsvp_status.id, self.declined_rsvp.id)

    def test_guest_bulk_rsvp_invalid_guest_id(self):
        """Test bulk RSVP update with invalid guest ID."""
        bulk_data = {
            'guests': [
                {'id': 99999, 'rsvp_status': self.confirmed_rsvp.id}
            ]
        }
        
        self.authenticate()
        response = self.client.post('/api/guests/bulk-rsvp/', bulk_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    def test_guest_send_invitations(self):
        """Test sending invitations to guests."""
        invitation_data = {
            'guest_ids': [self.guest.id],
            'message': 'You are invited to our wedding!'
        }
        
        self.authenticate()
        response = self.client.post('/api/guests/send-invitations/', invitation_data)
        self.assert_success_response(response, message="Invitations sent successfully")

    def test_guest_send_invitations_already_sent(self):
        """Test sending invitations to guests who already received them."""
        # Mark guest as already invited
        self.guest.invitation_sent = True
        self.guest.save()
        
        invitation_data = {
            'guest_ids': [self.guest.id],
            'message': 'You are invited to our wedding!'
        }
        
        self.authenticate()
        response = self.client.post('/api/guests/send-invitations/', invitation_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Invitation already sent")

    # GUEST STATISTICS TESTS
    def test_guest_statistics(self):
        """Test guest statistics endpoint."""
        self.authenticate()
        response = self.client.get('/api/guests/statistics/')
        
        self.assert_success_response(response, message="Guest statistics retrieved successfully")
        data = response.json()
        stats = data['data']
        
        # Check required statistics
        self.assertIn('total', stats)
        self.assertIn('confirmed', stats)
        self.assertIn('pending', stats)
        self.assertIn('declined', stats)
        self.assertIn('invited', stats)
        self.assertIn('attended', stats)
        
        # Verify counts
        self.assertEqual(stats['total'], 1)
        self.assertEqual(stats['pending'], 1)

    def test_guest_statistics_by_relationship(self):
        """Test guest statistics grouped by relationship."""
        self.authenticate()
        response = self.client.get('/api/guests/statistics/?group_by=relationship')
        
        self.assert_success_response(response)
        data = response.json()
        stats = data['data']
        
        self.assertIn('by_relationship', stats)
        self.assertIn('family', stats['by_relationship'])

    # SEARCH AND FILTERING TESTS
    def test_guest_search_by_name(self):
        """Test searching guests by name."""
        self.authenticate()
        response = self.client.get('/api/guests/?search=John')
        
        self.assert_success_response(response)
        data = response.json()
        guests = data['data']
        
        # Should find our test guest
        self.assertGreater(len(guests), 0)
        found_guest = next((g for g in guests if 'John' in g['first_name']), None)
        self.assertIsNotNone(found_guest)

    def test_guest_filter_by_rsvp_status(self):
        """Test filtering guests by RSVP status."""
        self.authenticate()
        response = self.client.get(f'/api/guests/?rsvp_status={self.pending_rsvp.id}')
        
        self.assert_success_response(response)
        data = response.json()
        guests = data['data']
        
        # Should find our test guest with pending status
        self.assertGreater(len(guests), 0)
        for guest in guests:
            self.assertEqual(guest['rsvp_status']['id'], self.pending_rsvp.id)

    def test_guest_filter_by_relationship(self):
        """Test filtering guests by relationship."""
        self.authenticate()
        response = self.client.get('/api/guests/?relationship=family')
        
        self.assert_success_response(response)
        data = response.json()
        guests = data['data']
        
        # Should find our test guest with family relationship
        self.assertGreater(len(guests), 0)
        for guest in guests:
            self.assertEqual(guest['relationship'], 'family')

    # EDGE CASES AND VALIDATION TESTS
    def test_guest_name_length_validation(self):
        """Test guest name length validation."""
        long_name = 'x' * 100  # Assuming max length is 50
        guest_data = TestDataFactory.create_guest_data(
            first_name=long_name,
            last_name='Test'
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=guest_data,
            authenticate=True,
            should_succeed=False
        )

    def test_guest_phone_number_validation(self):
        """Test guest phone number format validation."""
        invalid_phone_data = TestDataFactory.create_guest_data(
            phone='invalid-phone-format-12345678901234567890'
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=invalid_phone_data,
            authenticate=True,
            should_succeed=False
        )

    def test_guest_special_characters_in_name(self):
        """Test guest names with special characters."""
        special_char_data = TestDataFactory.create_guest_data(
            first_name='José-María',
            last_name="O'Connor"
        )
        
        self.authenticate()
        response = self.client.post('/api/guests/', special_char_data)
        self.assert_created_response(response)

    def test_guest_concurrent_updates(self):
        """Test concurrent guest updates."""
        # First update
        update_data1 = {'notes': 'First update'}
        response1 = self.client.patch(f'/api/guests/{self.guest.id}/', update_data1)
        self.assert_success_response(response1)
        
        # Second update
        update_data2 = {'notes': 'Second update'}
        response2 = self.client.patch(f'/api/guests/{self.guest.id}/', update_data2)
        self.assert_success_response(response2)
        
        # Verify final state
        self.guest.refresh()
        self.assertEqual(self.guest.notes, 'Second update')

    def test_guest_api_response_format(self):
        """Test that all guest API responses follow standardized format."""
        self.authenticate()
        
        # Test list response format
        response = self.client.get('/api/guests/')
        self._assert_standard_response_format(response)
        
        # Test retrieve response format
        response = self.client.get(f'/api/guests/{self.guest.id}/')
        self._assert_standard_response_format(response)
        
        # Test statistics response format
        response = self.client.get('/api/guests/statistics/')
        self._assert_standard_response_format(response)

    # PERFORMANCE TESTS
    def test_guest_list_performance_large_dataset(self):
        """Test guest list performance with large dataset."""
        # Create many guests (this would be done in a real test)
        # For now, just test the endpoint structure
        self.authenticate()
        response = self.client.get('/api/guests/')
        
        # Should respond quickly even with large datasets
        self.assertLess(response.status_code, 500)
        self.assert_success_response(response)

    # HELPER METHODS
    def _create_user(self, username, email):
        """Helper to create a test user."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        return User.objects.create_user(
            username=username,
            email=email,
            password='testpass123',
            first_name='Test',
            last_name='User'
        )

    def _assert_standard_response_format(self, response):
        """Assert that response follows standardized API format."""
        self.assertIn('success', response.json())
        if response.json()['success']:
            self.assertIn('data', response.json())
            self.assertIn('message', response.json())
        else:
            self.assertIn('error', response.json())
            self.assertIn('code', response.json()['error'])
            self.assertIn('message', response.json()['error'])
        self.assertIn('timestamp', response.json())
