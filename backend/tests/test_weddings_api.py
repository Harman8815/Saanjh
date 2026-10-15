"""
Comprehensive test cases for Wedding API endpoints.
"""

from datetime import date, timedelta
from django.urls import reverse
from rest_framework import status
from .test_utils import APITestCase, TestDataFactory, APIEndpointTester


class WeddingAPITestCase(APITestCase):
    """Test cases for Wedding API endpoints."""

    def setUp(self):
        super().setUp()
        self.endpoint_tester = APIEndpointTester(self, '/api/weddings/')
        self.dashboard_url = '/api/weddings/dashboard/'
        self.my_wedding_url = '/api/weddings/my-wedding/'
        self.timeline_url = '/api/weddings/timeline/'
        self.venue_search_url = '/api/weddings/venue-search/'

    # LIST TESTS
    def test_wedding_list_authenticated(self):
        """Test wedding list endpoint with authentication."""
        self.endpoint_tester.test_list_endpoint(authenticate=True, expected_count=1)

    def test_wedding_list_unauthenticated(self):
        """Test wedding list endpoint without authentication."""
        self.endpoint_tester.test_list_endpoint(authenticate=False)

    def test_wedding_list_empty_for_new_user(self):
        """Test wedding list for user with no wedding."""
        new_user = self._create_user('newuser', 'new@example.com')
        new_token = Token.objects.create(user=new_user)
        self.authenticate(new_token)
        
        response = self.client.get('/api/weddings/')
        self.assert_success_response(response)
        data = response.json()
        self.assertEqual(len(data['data']), 0)

    # RETRIEVE TESTS
    def test_wedding_retrieve_own_wedding(self):
        """Test retrieving own wedding."""
        self.endpoint_tester.test_retrieve_endpoint(
            obj_id=self.wedding.id,
            authenticate=True,
            should_exist=True
        )

    def test_wedding_retrieve_other_user_wedding_forbidden(self):
        """Test retrieving other user's wedding should be forbidden."""
        self.authenticate()
        response = self.client.get(f'/api/weddings/{self.other_wedding.id}/')
        self.assert_forbidden_response(response, "You don't have permission to access this wedding")

    def test_wedding_retrieve_nonexistent(self):
        """Test retrieving non-existent wedding."""
        self.endpoint_tester.test_retrieve_endpoint(
            obj_id=99999,
            authenticate=True,
            should_exist=False
        )

    def test_wedding_retrieve_unauthenticated(self):
        """Test wedding retrieve without authentication."""
        self.endpoint_tester.test_retrieve_endpoint(
            obj_id=self.wedding.id,
            authenticate=False
        )

    # CREATE TESTS
    def test_wedding_create_valid_data(self):
        """Test creating wedding with valid data."""
        wedding_data = TestDataFactory.create_wedding_data(
            wedding_date=(date.today() + timedelta(days=60)).isoformat(),
            theme='Beach Paradise'
        )
        
        # Delete existing wedding first
        self.wedding.delete()
        
        self.endpoint_tester.test_create_endpoint(
            data=wedding_data,
            authenticate=True,
            should_succeed=True
        )

    def test_wedding_create_invalid_date_past(self):
        """Test creating wedding with past date should fail validation."""
        wedding_data = TestDataFactory.create_wedding_data(
            wedding_date=(date.today() - timedelta(days=10)).isoformat(),
            theme='Past Wedding'
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=wedding_data,
            authenticate=True,
            should_succeed=False
        )

    def test_wedding_create_missing_required_fields(self):
        """Test creating wedding with missing required fields."""
        invalid_data = {'theme': 'Incomplete Wedding'}
        
        self.endpoint_tester.test_create_endpoint(
            data=invalid_data,
            authenticate=True,
            should_succeed=False
        )

    def test_wedding_create_unauthenticated(self):
        """Test wedding creation without authentication."""
        wedding_data = TestDataFactory.create_wedding_data()
        
        self.endpoint_tester.test_create_endpoint(
            data=wedding_data,
            authenticate=False
        )

    def test_wedding_create_duplicate_for_user(self):
        """Test creating duplicate wedding for same user should fail."""
        wedding_data = TestDataFactory.create_wedding_data(
            wedding_date=(date.today() + timedelta(days=90)).isoformat(),
            theme='Second Wedding'
        )
        
        response = self.client.post('/api/weddings/', wedding_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    # UPDATE TESTS
    def test_wedding_update_valid_data(self):
        """Test updating wedding with valid data."""
        update_data = TestDataFactory.create_wedding_data(
            wedding_date=(date.today() + timedelta(days=45)).isoformat(),
            theme='Updated Theme'
        )
        
        self.endpoint_tester.test_update_endpoint(
            obj_id=self.wedding.id,
            data=update_data,
            authenticate=True,
            should_succeed=True
        )

    def test_wedding_update_other_user_wedding_forbidden(self):
        """Test updating other user's wedding should be forbidden."""
        update_data = TestDataFactory.create_wedding_data(theme='Hacked Theme')
        
        self.authenticate()
        response = self.client.put(f'/api/weddings/{self.other_wedding.id}/', update_data)
        self.assert_forbidden_response(response)

    def test_wedding_update_invalid_date(self):
        """Test updating wedding with invalid date."""
        update_data = TestDataFactory.create_wedding_data(
            wedding_date='invalid-date',
            theme='Invalid Date Wedding'
        )
        
        self.endpoint_tester.test_update_endpoint(
            obj_id=self.wedding.id,
            data=update_data,
            authenticate=True,
            should_succeed=False
        )

    def test_wedding_update_unauthenticated(self):
        """Test wedding update without authentication."""
        update_data = TestDataFactory.create_wedding_data(theme='Unauthorized Update')
        
        self.endpoint_tester.test_update_endpoint(
            obj_id=self.wedding.id,
            data=update_data,
            authenticate=False
        )

    # PARTIAL UPDATE TESTS
    def test_wedding_partial_update_theme(self):
        """Test partial update of wedding theme."""
        partial_data = {'theme': 'Partially Updated Theme'}
        
        self.endpoint_tester.test_partial_update_endpoint(
            obj_id=self.wedding.id,
            data=partial_data,
            authenticate=True,
            should_succeed=True
        )

    def test_wedding_partial_update_invalid_field(self):
        """Test partial update with invalid field."""
        partial_data = {'wedding_date': 'invalid-date'}
        
        self.endpoint_tester.test_partial_update_endpoint(
            obj_id=self.wedding.id,
            data=partial_data,
            authenticate=True,
            should_succeed=False
        )

    # DELETE TESTS
    def test_wedding_delete_own_wedding(self):
        """Test deleting own wedding."""
        self.endpoint_tester.test_delete_endpoint(
            obj_id=self.wedding.id,
            authenticate=True,
            should_succeed=True
        )

    def test_wedding_delete_other_user_wedding_forbidden(self):
        """Test deleting other user's wedding should be forbidden."""
        self.authenticate()
        response = self.client.delete(f'/api/weddings/{self.other_wedding.id}/')
        self.assert_forbidden_response(response)

    def test_wedding_delete_nonexistent(self):
        """Test deleting non-existent wedding."""
        self.endpoint_tester.test_delete_endpoint(
            obj_id=99999,
            authenticate=True,
            should_succeed=False
        )

    def test_wedding_delete_unauthenticated(self):
        """Test wedding deletion without authentication."""
        self.endpoint_tester.test_delete_endpoint(
            obj_id=self.wedding.id,
            authenticate=False
        )

    # DASHBOARD API TESTS
    def test_wedding_dashboard_authenticated(self):
        """Test wedding dashboard endpoint with authentication."""
        self.authenticate()
        response = self.client.get(self.dashboard_url)
        
        self.assert_success_response(response, message="Dashboard data retrieved successfully")
        data = response.json()
        dashboard_data = data['data']
        
        # Check required dashboard sections
        self.assertIn('wedding', dashboard_data)
        self.assertIn('guest_stats', dashboard_data)
        self.assertIn('vendor_stats', dashboard_data)
        self.assertIn('expense_stats', dashboard_data)
        self.assertIn('recent_activities', dashboard_data)
        
        # Check wedding data
        wedding_data = dashboard_data['wedding']
        self.assertEqual(wedding_data['id'], self.wedding.id)
        self.assertEqual(wedding_data['theme'], self.wedding.theme)
        
        # Check guest stats
        guest_stats = dashboard_data['guest_stats']
        self.assertIn('total', guest_stats)
        self.assertIn('confirmed', guest_stats)
        self.assertIn('pending', guest_stats)
        self.assertIn('declined', guest_stats)
        self.assertEqual(guest_stats['total'], 1)  # One test guest

    def test_wedding_dashboard_no_wedding(self):
        """Test dashboard endpoint for user with no wedding."""
        new_user = self._create_user('nowedding', 'nowedding@example.com')
        new_token = Token.objects.create(user=new_user)
        self.authenticate(new_token)
        
        response = self.client.get(self.dashboard_url)
        self.assert_error_response(response, 404, "NOT_FOUND", "No wedding found")

    def test_wedding_dashboard_unauthenticated(self):
        """Test dashboard endpoint without authentication."""
        response = self.client.get(self.dashboard_url)
        self.assert_unauthorized_response(response)

    # MY WEDDING API TESTS
    def test_my_wedding_existing_wedding(self):
        """Test my-wedding endpoint for user with existing wedding."""
        self.authenticate()
        response = self.client.get(self.my_wedding_url)
        
        self.assert_success_response(response, message="Wedding retrieved successfully")
        data = response.json()
        self.assertEqual(data['data']['id'], self.wedding.id)

    def test_my_wedding_no_wedding_creates_one(self):
        """Test my-wedding endpoint creates wedding for user with none."""
        new_user = self._create_user('myweddinguser', 'mywedding@example.com')
        new_token = Token.objects.create(user=new_user)
        self.authenticate(new_token)
        
        response = self.client.get(self.my_wedding_url)
        self.assert_success_response(response, message="Wedding created successfully")
        data = response.json()
        self.assertIn('id', data['data'])
        self.assertEqual(data['data']['user'], new_user.id)

    def test_my_wedding_unauthenticated(self):
        """Test my-wedding endpoint without authentication."""
        response = self.client.get(self.my_wedding_url)
        self.assert_unauthorized_response(response)

    # TIMELINE API TESTS
    def test_wedding_timeline_authenticated(self):
        """Test wedding timeline endpoint with authentication."""
        self.authenticate()
        response = self.client.get(self.timeline_url)
        
        self.assert_success_response(response)
        data = response.json()
        timeline_data = data['data']
        
        # Should have events for guest, vendor, and expense
        self.assertIsInstance(timeline_data, list)
        self.assertGreater(len(timeline_data), 0)

    def test_wedding_timeline_unauthenticated(self):
        """Test timeline endpoint without authentication."""
        response = self.client.get(self.timeline_url)
        self.assert_unauthorized_response(response)

    # VENUE SEARCH API TESTS
    def test_venue_search_valid_parameters(self):
        """Test venue search with valid parameters."""
        self.authenticate()
        params = {
            'capacity_min': 50,
            'capacity_max': 200,
            'type': 'garden'
        }
        
        response = self.client.get(self.venue_search_url, params)
        
        self.assert_success_response(response)
        data = response.json()
        search_data = data['data']
        
        self.assertIn('venues', search_data)
        self.assertIn('filters', search_data)
        self.assertIn('count', search_data)
        
        # Check filters match request
        filters = search_data['filters']
        self.assertEqual(filters['capacity_min'], 50)
        self.assertEqual(filters['capacity_max'], 200)
        self.assertEqual(filters['type'], 'garden')

    def test_venue_search_invalid_capacity(self):
        """Test venue search with invalid capacity values."""
        self.authenticate()
        params = {
            'capacity_min': 'invalid',
            'capacity_max': 200
        }
        
        response = self.client.get(self.venue_search_url, params)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Invalid search parameters")

    def test_venue_search_invalid_range(self):
        """Test venue search with invalid capacity range."""
        self.authenticate()
        params = {
            'capacity_min': 300,
            'capacity_max': 100  # Min > Max
        }
        
        response = self.client.get(self.venue_search_url, params)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Invalid capacity range")

    def test_venue_search_unauthenticated(self):
        """Test venue search without authentication."""
        response = self.client.get(self.venue_search_url)
        self.assert_unauthorized_response(response)

    # EDGE CASES AND VALIDATION TESTS
    def test_wedding_date_validation_far_future(self):
        """Test wedding date validation for far future dates."""
        future_date = (date.today() + timedelta(days=1000)).isoformat()
        wedding_data = TestDataFactory.create_wedding_data(wedding_date=future_date)
        
        self.wedding.delete()
        response = self.client.post('/api/weddings/', wedding_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    def test_wedding_theme_length_validation(self):
        """Test wedding theme length validation."""
        long_theme = 'x' * 200  # Assuming max length is 100
        wedding_data = TestDataFactory.create_wedding_data(theme=long_theme)
        
        self.wedding.delete()
        response = self.client.post('/api/weddings/', wedding_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    def test_wedding_api_response_format(self):
        """Test that all wedding API responses follow standardized format."""
        self.authenticate()
        
        # Test list response format
        response = self.client.get('/api/weddings/')
        self._assert_standard_response_format(response)
        
        # Test retrieve response format
        response = self.client.get(f'/api/weddings/{self.wedding.id}/')
        self._assert_standard_response_format(response)
        
        # Test dashboard response format
        response = self.client.get(self.dashboard_url)
        self._assert_standard_response_format(response)

    def test_wedding_concurrent_updates(self):
        """Test concurrent wedding updates."""
        # First update
        update_data1 = {'theme': 'Concurrent Update 1'}
        response1 = self.client.patch(f'/api/weddings/{self.wedding.id}/', update_data1)
        self.assert_success_response(response1)
        
        # Second update
        update_data2 = {'theme': 'Concurrent Update 2'}
        response2 = self.client.patch(f'/api/weddings/{self.wedding.id}/', update_data2)
        self.assert_success_response(response2)
        
        # Verify final state
        self.wedding.refresh()
        self.assertEqual(self.wedding.theme, 'Concurrent Update 2')

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
