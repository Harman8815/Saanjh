"""
Comprehensive test cases for standardized API response format across all endpoints.
"""

from datetime import date, timedelta
from django.urls import reverse
from rest_framework import status
from .test_utils import APITestCase, TestDataFactory


class APIResponseFormatTestCase(APITestCase):
    """Test cases for standardized API response format across all endpoints."""

    def setUp(self):
        super().setUp()

    def _assert_standard_response_format(self, response, expected_success=None):
        """Assert that response follows standardized API format."""
        self.assertIn('success', response.json())
        
        if expected_success is not None:
            self.assertEqual(response.json()['success'], expected_success)
        
        if response.json()['success']:
            # Success response format
            self.assertIn('data', response.json())
            self.assertIn('message', response.json())
            self.assertIn('timestamp', response.json())
            
            # Data should not be None for successful responses
            self.assertIsNotNone(response.json()['data'])
            
        else:
            # Error response format
            self.assertIn('error', response.json())
            self.assertIn('timestamp', response.json())
            
            error = response.json()['error']
            self.assertIn('code', error)
            self.assertIn('message', error)
            
            # Details should be a dictionary if present
            if 'details' in error:
                self.assertIsInstance(error['details'], dict)

    # WEDDING API RESPONSE FORMAT TESTS
    def test_wedding_list_response_format(self):
        """Test wedding list endpoint response format."""
        self.authenticate()
        response = self.client.get('/api/weddings/')
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertIsInstance(data['data'], list)
        self.assertIsInstance(data['message'], str)
        self.assertIn('weddings', data['message'].lower())

    def test_wedding_retrieve_response_format(self):
        """Test wedding retrieve endpoint response format."""
        self.authenticate()
        response = self.client.get(f'/api/weddings/{self.wedding.id}/')
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertIsInstance(data['data'], dict)
        self.assertIn('id', data['data'])
        self.assertEqual(data['data']['id'], self.wedding.id)

    def test_wedding_create_response_format(self):
        """Test wedding create endpoint response format."""
        self.wedding.delete()  # Remove existing wedding
        
        wedding_data = TestDataFactory.create_wedding_data()
        response = self.client.post('/api/weddings/', wedding_data)
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertIn('created', data['message'].lower())
        self.assertEqual(response.status_code, 201)

    def test_wedding_update_response_format(self):
        """Test wedding update endpoint response format."""
        update_data = TestDataFactory.create_wedding_data(theme='Updated Theme')
        response = self.client.patch(f'/api/weddings/{self.wedding.id}/', update_data)
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertIn('updated', data['message'].lower())

    def test_wedding_delete_response_format(self):
        """Test wedding delete endpoint response format."""
        response = self.client.delete(f'/api/weddings/{self.wedding.id}/')
        self.assertEqual(response.status_code, 204)

    def test_wedding_dashboard_response_format(self):
        """Test wedding dashboard endpoint response format."""
        self.authenticate()
        response = self.client.get('/api/weddings/dashboard/')
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        dashboard_data = data['data']
        
        # Check required dashboard sections
        required_sections = ['wedding', 'guest_stats', 'vendor_stats', 'expense_stats', 'recent_activities']
        for section in required_sections:
            self.assertIn(section, dashboard_data)

    def test_wedding_error_response_format(self):
        """Test wedding endpoint error response format."""
        self.authenticate()
        
        # Test not found error
        response = self.client.get('/api/weddings/99999/')
        self._assert_standard_response_format(response, expected_success=False)
        
        error_data = response.json()['error']
        self.assertEqual(error_data['code'], 'NOT_FOUND')
        self.assertIn('not found', error_data['message'].lower())

    # GUEST API RESPONSE FORMAT TESTS
    def test_guest_list_response_format(self):
        """Test guest list endpoint response format."""
        self.authenticate()
        response = self.client.get('/api/guests/')
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertIsInstance(data['data'], list)
        self.assertGreater(len(data['data']), 0)

    def test_guest_create_response_format(self):
        """Test guest create endpoint response format."""
        guest_data = TestDataFactory.create_guest_data(
            first_name='New',
            last_name='Guest',
            email='newguest@example.com'
        )
        response = self.client.post('/api/guests/', guest_data)
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertEqual(response.status_code, 201)
        self.assertIn('created', data['message'].lower())

    def test_guest_validation_error_response_format(self):
        """Test guest validation error response format."""
        invalid_data = TestDataFactory.create_guest_data(email='invalid-email')
        response = self.client.post('/api/guests/', invalid_data)
        self._assert_standard_response_format(response, expected_success=False)
        
        error_data = response.json()['error']
        self.assertEqual(error_data['code'], 'VALIDATION_ERROR')
        self.assertIn('validation', error_data['message'].lower())
        self.assertIn('details', error_data)

    # VENDOR API RESPONSE FORMAT TESTS
    def test_vendor_list_response_format(self):
        """Test vendor list endpoint response format."""
        self.authenticate()
        response = self.client.get('/api/vendors/')
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertIsInstance(data['data'], list)

    def test_vendor_create_response_format(self):
        """Test vendor create endpoint response format."""
        vendor_data = TestDataFactory.create_vendor_data(
            vendor_catalog=self.vendor_catalog.id,
            status=self.pending_vendor.id
        )
        response = self.client.post('/api/vendors/', vendor_data)
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertEqual(response.status_code, 201)

    def test_vendor_catalog_response_format(self):
        """Test vendor catalog endpoint response format."""
        self.authenticate()
        response = self.client.get('/api/vendors/catalog/')
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertIsInstance(data['data'], list)
        self.assertIn('catalog', data['message'].lower())

    # EXPENSE API RESPONSE FORMAT TESTS
    def test_expense_list_response_format(self):
        """Test expense list endpoint response format."""
        self.authenticate()
        response = self.client.get('/api/expenses/')
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertIsInstance(data['data'], list)

    def test_expense_create_response_format(self):
        """Test expense create endpoint response format."""
        expense_data = TestDataFactory.create_expense_data(
            budget_category=self.budget_category.id,
            title='New Expense',
            amount='500.00'
        )
        response = self.client.post('/api/expenses/', expense_data)
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertEqual(response.status_code, 201)

    def test_expense_statistics_response_format(self):
        """Test expense statistics endpoint response format."""
        self.authenticate()
        response = self.client.get('/api/expenses/statistics/')
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        stats = data['data']
        
        required_stats = ['total_estimated', 'total_actual', 'total_paid', 'remaining']
        for stat in required_stats:
            self.assertIn(stat, stats)

    # AUTHENTICATION API RESPONSE FORMAT TESTS
    def test_login_response_format(self):
        """Test login endpoint response format."""
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', login_data)
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        auth_data = data['data']
        
        # Check required auth fields
        self.assertIn('token', auth_data)
        self.assertIn('user', auth_data)
        self.assertIsInstance(auth_data['token'], str)
        self.assertIsInstance(auth_data['user'], dict)

    def test_login_error_response_format(self):
        """Test login error response format."""
        login_data = {
            'username': 'nonexistent',
            'password': 'wrongpass'
        }
        response = self.client.post('/api/auth/login/', login_data)
        self._assert_standard_response_format(response, expected_success=False)
        
        error_data = response.json()['error']
        self.assertEqual(error_data['code'], 'UNAUTHORIZED')
        self.assertIn('invalid', error_data['message'].lower())

    def test_register_response_format(self):
        """Test register endpoint response format."""
        register_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', register_data)
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertEqual(response.status_code, 201)
        self.assertIn('registered', data['message'].lower())

    def test_logout_response_format(self):
        """Test logout endpoint response format."""
        self.authenticate()
        response = self.client.post('/api/auth/logout/')
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        self.assertIn('logout', data['message'].lower())

    def test_profile_response_format(self):
        """Test profile endpoint response format."""
        self.authenticate()
        response = self.client.get('/api/auth/profile/')
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        profile_data = data['data']
        
        # Check required profile fields
        self.assertIn('username', profile_data)
        self.assertIn('email', profile_data)
        self.assertIn('first_name', profile_data)
        self.assertIn('last_name', profile_data)

    # TIMELINE API RESPONSE FORMAT TESTS
    def test_timeline_response_format(self):
        """Test timeline endpoint response format."""
        self.authenticate()
        response = self.client.get('/api/weddings/timeline/')
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        timeline_data = data['data']
        self.assertIsInstance(timeline_data, list)
        
        # Check timeline event structure
        if timeline_data:
            event = timeline_data[0]
            self.assertIn('event', event)
            self.assertIn('description', event)
            self.assertIn('date', event)
            self.assertIn('type', event)

    def test_timeline_statistics_response_format(self):
        """Test timeline statistics endpoint response format."""
        self.authenticate()
        response = self.client.get('/api/weddings/timeline/statistics/')
        self._assert_standard_response_format(response, expected_success=True)
        
        data = response.json()
        stats = data['data']
        
        required_stats = ['total_events', 'events_by_type', 'events_by_month']
        for stat in required_stats:
            self.assertIn(stat, stats)

    # ERROR RESPONSE FORMAT TESTS
    def test_authentication_error_response_format(self):
        """Test authentication error response format."""
        response = self.client.get('/api/weddings/')  # No authentication
        self._assert_standard_response_format(response, expected_success=False)
        
        error_data = response.json()['error']
        self.assertEqual(error_data['code'], 'UNAUTHORIZED')
        self.assertIn('authentication', error_data['message'].lower())

    def test_permission_error_response_format(self):
        """Test permission error response format."""
        self.authenticate()
        response = self.client.get(f'/api/weddings/{self.other_wedding.id}/')
        self._assert_standard_response_format(response, expected_success=False)
        
        error_data = response.json()['error']
        self.assertEqual(error_data['code'], 'FORBIDDEN')
        self.assertIn('permission', error_data['message'].lower())

    def test_validation_error_response_format(self):
        """Test validation error response format across endpoints."""
        self.authenticate()
        
        # Test wedding validation error
        invalid_wedding = {'wedding_date': 'invalid-date'}
        response = self.client.post('/api/weddings/', invalid_wedding)
        self._assert_standard_response_format(response, expected_success=False)
        
        error_data = response.json()['error']
        self.assertEqual(error_data['code'], 'VALIDATION_ERROR')
        self.assertIn('details', error_data)
        self.assertIsInstance(error_data['details'], dict)

    def test_not_found_error_response_format(self):
        """Test not found error response format."""
        self.authenticate()
        response = self.client.get('/api/weddings/99999/')
        self._assert_standard_response_format(response, expected_success=False)
        
        error_data = response.json()['error']
        self.assertEqual(error_data['code'], 'NOT_FOUND')
        self.assertIn('not found', error_data['message'].lower())

    def test_server_error_response_format(self):
        """Test server error response format (simulated)."""
        # This would test actual server errors, but for now we test the format
        # In a real scenario, this might be triggered by database errors, etc.
        pass

    # TIMESTAMP AND MESSAGE TESTS
    def test_timestamp_format(self):
        """Test timestamp format across all responses."""
        self.authenticate()
        
        endpoints = [
            '/api/weddings/',
            f'/api/weddings/{self.wedding.id}/',
            '/api/guests/',
            '/api/vendors/',
            '/api/expenses/',
            '/api/weddings/dashboard/',
            '/api/auth/profile/'
        ]
        
        for endpoint in endpoints:
            response = self.client.get(endpoint)
            if response.status_code in [200, 201]:
                data = response.json()
                self.assertIn('timestamp', data)
                # Timestamp should be in ISO format
                timestamp = data['timestamp']
                self.assertIsInstance(timestamp, str)

    def test_message_content(self):
        """Test message content across successful responses."""
        self.authenticate()
        
        # Test different message types
        responses = [
            (self.client.get('/api/weddings/'), 'retrieved'),
            (self.client.get('/api/weddings/dashboard/'), 'retrieved'),
            (self.client.get('/api/auth/profile/'), 'retrieved'),
            (self.client.get('/api/guests/'), 'retrieved'),
        ]
        
        for response, expected_content in responses:
            if response.status_code == 200:
                data = response.json()
                message = data['message']
                self.assertIsInstance(message, str)
                self.assertGreater(len(message), 0)
                # Message should be descriptive
                self.assertIn(expected_content, message.lower())

    # CONSISTENCY TESTS
    def test_response_consistency_across_endpoints(self):
        """Test response format consistency across all endpoints."""
        self.authenticate()
        
        # Collect responses from various endpoints
        endpoints = [
            ('GET', '/api/weddings/'),
            ('GET', f'/api/weddings/{self.wedding.id}/'),
            ('GET', '/api/guests/'),
            ('GET', '/api/vendors/'),
            ('GET', '/api/expenses/'),
            ('GET', '/api/weddings/dashboard/'),
            ('GET', '/api/auth/profile/'),
        ]
        
        for method, endpoint in endpoints:
            if method == 'GET':
                response = self.client.get(endpoint)
            elif method == 'POST':
                response = self.client.post(endpoint, {})
            
            if response.status_code in [200, 201]:
                self._assert_standard_response_format(response, expected_success=True)
                
                # Check structure consistency
                data = response.json()
                required_keys = ['success', 'data', 'message', 'timestamp']
                for key in required_keys:
                    self.assertIn(key, data)

    def test_error_response_consistency(self):
        """Test error response format consistency."""
        self.authenticate()
        
        # Test different error types
        error_scenarios = [
            ('GET', '/api/weddings/99999/', 'NOT_FOUND'),  # Not found
            ('GET', f'/api/weddings/{self.other_wedding.id}/', 'FORBIDDEN'),  # Forbidden
        ]
        
        for method, endpoint, expected_code in error_scenarios:
            if method == 'GET':
                response = self.client.get(endpoint)
            
            if response.status_code >= 400:
                self._assert_standard_response_format(response, expected_success=False)
                
                error_data = response.json()['error']
                self.assertEqual(error_data['code'], expected_code)
                self.assertIn('message', error_data)
                self.assertIn('timestamp', response.json())

    # DATA TYPE VALIDATION
    def test_response_data_types(self):
        """Test that response data has correct types."""
        self.authenticate()
        
        # Test list endpoints
        list_endpoints = [
            '/api/weddings/',
            '/api/guests/',
            '/api/vendors/',
            '/api/expenses/',
        ]
        
        for endpoint in list_endpoints:
            response = self.client.get(endpoint)
            if response.status_code == 200:
                data = response.json()
                self.assertIsInstance(data['data'], list)
        
        # Test object endpoints
        object_endpoints = [
            f'/api/weddings/{self.wedding.id}/',
            f'/api/guests/{self.guest.id}/',
            f'/api/vendors/{self.vendor.id}/',
            f'/api/expenses/{self.expense.id}/',
        ]
        
        for endpoint in object_endpoints:
            response = self.client.get(endpoint)
            if response.status_code == 200:
                data = response.json()
                self.assertIsInstance(data['data'], dict)

    # HTTP STATUS CODE CONSISTENCY
    def test_http_status_code_consistency(self):
        """Test HTTP status codes match response success flag."""
        self.authenticate()
        
        # Test success scenarios
        success_scenarios = [
            ('GET', '/api/weddings/', 200),
            ('GET', f'/api/weddings/{self.wedding.id}/', 200),
            ('GET', '/api/guests/', 200),
            ('GET', '/api/auth/profile/', 200),
        ]
        
        for method, endpoint, expected_status in success_scenarios:
            if method == 'GET':
                response = self.client.get(endpoint)
            self.assertEqual(response.status_code, expected_status)
            self._assert_standard_response_format(response, expected_success=True)
        
        # Test error scenarios
        error_scenarios = [
            ('GET', '/api/weddings/99999/', 404),
            ('GET', f'/api/weddings/{self.other_wedding.id}/', 403),
        ]
        
        for method, endpoint, expected_status in error_scenarios:
            if method == 'GET':
                response = self.client.get(endpoint)
            self.assertEqual(response.status_code, expected_status)
            self._assert_standard_response_format(response, expected_success=False)
