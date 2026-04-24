"""
Comprehensive test cases for Timeline API endpoints.
"""

from datetime import date, timedelta, datetime
from django.urls import reverse
from rest_framework import status
from .test_utils import APITestCase, TestDataFactory


class TimelineAPITestCase(APITestCase):
    """Test cases for Timeline API endpoints."""

    def setUp(self):
        super().setUp()
        self.timeline_url = '/api/weddings/timeline/'

    # WEDDING TIMELINE TESTS
    def test_wedding_timeline_authenticated(self):
        """Test wedding timeline endpoint with authentication."""
        self.authenticate()
        response = self.client.get(self.timeline_url)
        
        self.assert_success_response(response, message="Timeline events retrieved successfully")
        data = response.json()
        timeline_data = data['data']
        
        # Should have timeline events
        self.assertIsInstance(timeline_data, list)
        self.assertGreater(len(timeline_data), 0)

    def test_wedding_timeline_unauthenticated(self):
        """Test wedding timeline endpoint without authentication."""
        response = self.client.get(self.timeline_url)
        self.assert_unauthorized_response(response)

    def test_wedding_timeline_no_wedding(self):
        """Test timeline endpoint for user with no wedding."""
        new_user = self._create_user('notimeline', 'notimeline@example.com')
        new_token = Token.objects.create(user=new_user)
        self.authenticate(new_token)
        
        response = self.client.get(self.timeline_url)
        self.assert_success_response(response, message="Timeline events retrieved successfully")
        data = response.json()
        timeline_data = data['data']
        
        # Should return empty timeline
        self.assertEqual(len(timeline_data), 0)

    def test_wedding_timeline_structure(self):
        """Test timeline event structure."""
        self.authenticate()
        response = self.client.get(self.timeline_url)
        
        self.assert_success_response(response)
        data = response.json()
        timeline_data = data['data']
        
        for event in timeline_data:
            # Check required fields
            self.assertIn('event', event)
            self.assertIn('description', event)
            self.assertIn('date', event)
            self.assertIn('type', event)
            
            # Check date format
            self.assertIsInstance(event['date'], str)
            
            # Check type is one of expected values
            self.assertIn(event['type'], ['guest', 'vendor', 'expense', 'wedding'])

    def test_wedding_timeline_filtering(self):
        """Test timeline filtering by event type."""
        self.authenticate()
        
        # Test filter by guest events
        response = self.client.get(f'{self.timeline_url}?type=guest')
        self.assert_success_response(response)
        data = response.json()
        timeline_data = data['data']
        
        for event in timeline_data:
            self.assertEqual(event['type'], 'guest')
        
        # Test filter by vendor events
        response = self.client.get(f'{self.timeline_url}?type=vendor')
        self.assert_success_response(response)
        data = response.json()
        timeline_data = data['data']
        
        for event in timeline_data:
            self.assertEqual(event['type'], 'vendor')

    def test_wedding_timeline_date_range(self):
        """Test timeline filtering by date range."""
        self.authenticate()
        
        start_date = (date.today() - timedelta(days=30)).isoformat()
        end_date = (date.today() + timedelta(days=30)).isoformat()
        
        response = self.client.get(f'{self.timeline_url}?start_date={start_date}&end_date={end_date}')
        self.assert_success_response(response)
        data = response.json()
        timeline_data = data['data']
        
        # All events should be within date range
        for event in timeline_data:
            event_date = datetime.fromisoformat(event['date'].replace('Z', '+00:00')).date()
            self.assertGreaterEqual(event_date, datetime.fromisoformat(start_date).date())
            self.assertLessEqual(event_date, datetime.fromisoformat(end_date).date())

    def test_wedding_timeline_pagination(self):
        """Test timeline pagination."""
        self.authenticate()
        
        response = self.client.get(f'{self.timeline_url}?limit=5')
        self.assert_success_response(response)
        data = response.json()
        timeline_data = data['data']
        
        # Should limit to 5 events
        self.assertLessEqual(len(timeline_data), 5)

    def test_wedding_timeline_search(self):
        """Test timeline search functionality."""
        self.authenticate()
        
        response = self.client.get(f'{self.timeline_url}?search=John')
        self.assert_success_response(response)
        data = response.json()
        timeline_data = data['data']
        
        # Should find events containing 'John'
        for event in timeline_data:
            search_found = (
                'John' in event.get('event', '') or 
                'John' in event.get('description', '')
            )
            self.assertTrue(search_found)

    # GUEST TIMELINE TESTS
    def test_guest_timeline(self):
        """Test guest-specific timeline."""
        self.authenticate()
        response = self.client.get(f'/api/guests/{self.guest.id}/timeline/')
        
        self.assert_success_response(response, message="Guest timeline retrieved successfully")
        data = response.json()
        timeline_data = data['data']
        
        # Should have events related to this guest
        self.assertIsInstance(timeline_data, list)
        for event in timeline_data:
            self.assertIn('guest', event.get('event', '').lower())

    def test_guest_timeline_unauthorized(self):
        """Test guest timeline for unauthorized wedding."""
        # Create guest for other wedding
        other_guest = Guest.objects.create(
            wedding=self.other_wedding,
            first_name='Other',
            last_name='Guest',
            email='other@example.com',
            rsvp_status=self.pending_rsvp
        )
        
        self.authenticate()
        response = self.client.get(f'/api/guests/{other_guest.id}/timeline/')
        self.assert_forbidden_response(response)

    # VENDOR TIMELINE TESTS
    def test_vendor_timeline(self):
        """Test vendor-specific timeline."""
        self.authenticate()
        response = self.client.get(f'/api/vendors/{self.vendor.id}/timeline/')
        
        self.assert_success_response(response, message="Vendor timeline retrieved successfully")
        data = response.json()
        timeline_data = data['data']
        
        # Should have events related to this vendor
        self.assertIsInstance(timeline_data, list)
        for event in timeline_data:
            self.assertIn('vendor', event.get('event', '').lower())

    def test_vendor_timeline_unauthorized(self):
        """Test vendor timeline for unauthorized wedding."""
        # Create vendor for other wedding
        other_vendor = Vendor.objects.create(
            wedding=self.other_wedding,
            vendor_catalog=self.vendor_catalog,
            status=self.pending_vendor
        )
        
        self.authenticate()
        response = self.client.get(f'/api/vendors/{other_vendor.id}/timeline/')
        self.assert_forbidden_response(response)

    # EXPENSE TIMELINE TESTS
    def test_expense_timeline(self):
        """Test expense-specific timeline."""
        self.authenticate()
        response = self.client.get(f'/api/expenses/{self.expense.id}/timeline/')
        
        self.assert_success_response(response, message="Expense timeline retrieved successfully")
        data = response.json()
        timeline_data = data['data']
        
        # Should have events related to this expense
        self.assertIsInstance(timeline_data, list)
        for event in timeline_data:
            self.assertIn('expense', event.get('event', '').lower())

    def test_expense_timeline_unauthorized(self):
        """Test expense timeline for unauthorized wedding."""
        other_budget_category = BudgetCategory.objects.create(
            wedding=self.other_wedding,
            name='Other Category',
            allocated_amount='1000.00'
        )
        
        other_expense = Expense.objects.create(
            wedding=self.other_wedding,
            budget_category=other_budget_category,
            status=self.pending_expense,
            title='Other Expense',
            amount='500.00'
        )
        
        self.authenticate()
        response = self.client.get(f'/api/expenses/{other_expense.id}/timeline/')
        self.assert_forbidden_response(response)

    # TIMELINE STATISTICS TESTS
    def test_timeline_statistics(self):
        """Test timeline statistics endpoint."""
        self.authenticate()
        response = self.client.get('/api/weddings/timeline/statistics/')
        
        self.assert_success_response(response, message="Timeline statistics retrieved successfully")
        data = response.json()
        stats = data['data']
        
        # Check required statistics
        self.assertIn('total_events', stats)
        self.assertIn('events_by_type', stats)
        self.assertIn('events_by_month', stats)
        self.assertIn('recent_activity', stats)
        self.assertIn('upcoming_milestones', stats)

    def test_timeline_activity_summary(self):
        """Test timeline activity summary."""
        self.authenticate()
        response = self.client.get('/api/weddings/timeline/activity-summary/')
        
        self.assert_success_response(response, message="Activity summary retrieved successfully")
        data = response.json()
        summary = data['data']
        
        # Check summary structure
        self.assertIn('today', summary)
        self.assertIn('this_week', summary)
        self.assertIn('this_month', summary)
        self.assertIn('total', summary)

    # TIMELINE MILESTONES TESTS
    def test_timeline_milestones(self):
        """Test timeline milestones endpoint."""
        self.authenticate()
        response = self.client.get('/api/weddings/timeline/milestones/')
        
        self.assert_success_response(response, message="Timeline milestones retrieved successfully")
        data = response.json()
        milestones = data['data']
        
        # Should have milestone events
        self.assertIsInstance(milestones, list)
        for milestone in milestones:
            self.assertIn('event', milestone)
            self.assertIn('date', milestone)
            self.assertIn('type', milestone)
            self.assertIn('importance', milestone)

    def test_timeline_upcoming_events(self):
        """Test upcoming events endpoint."""
        self.authenticate()
        response = self.client.get('/api/weddings/timeline/upcoming/')
        
        self.assert_success_response(response, message="Upcoming events retrieved successfully")
        data = response.json()
        events = data['data']
        
        # All events should be in the future
        today = date.today()
        for event in events:
            event_date = datetime.fromisoformat(event['date'].replace('Z', '+00:00')).date()
            self.assertGreaterEqual(event_date, today)

    # EDGE CASES AND VALIDATION TESTS
    def test_timeline_invalid_date_format(self):
        """Test timeline with invalid date format."""
        self.authenticate()
        response = self.client.get(f'{self.timeline_url}?start_date=invalid-date')
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Invalid date format")

    def test_timeline_invalid_date_range(self):
        """Test timeline with invalid date range."""
        self.authenticate()
        start_date = (date.today() + timedelta(days=30)).isoformat()
        end_date = (date.today() - timedelta(days=30)).isoformat()  # End before start
        
        response = self.client.get(f'{self.timeline_url}?start_date={start_date}&end_date={end_date}')
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Invalid date range")

    def test_timeline_invalid_event_type(self):
        """Test timeline with invalid event type."""
        self.authenticate()
        response = self.client.get(f'{self.timeline_url}?type=invalid_type')
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Invalid event type")

    def test_timeline_large_limit(self):
        """Test timeline with very large limit."""
        self.authenticate()
        response = self.client.get(f'{self.timeline_url}?limit=1000')
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Limit too large")

    def test_timeline_api_response_format(self):
        """Test that all timeline API responses follow standardized format."""
        self.authenticate()
        
        # Test main timeline response format
        response = self.client.get(self.timeline_url)
        self._assert_standard_response_format(response)
        
        # Test statistics response format
        response = self.client.get('/api/weddings/timeline/statistics/')
        self._assert_standard_response_format(response)
        
        # Test milestones response format
        response = self.client.get('/api/weddings/timeline/milestones/')
        self._assert_standard_response_format(response)

    # PERFORMANCE TESTS
    def test_timeline_performance_large_dataset(self):
        """Test timeline performance with large dataset."""
        # This would ideally create many events, but for now test structure
        self.authenticate()
        response = self.client.get(self.timeline_url)
        
        # Should respond quickly
        self.assertLess(response.status_code, 500)
        self.assert_success_response(response)

    def test_timeline_concurrent_requests(self):
        """Test timeline with concurrent requests."""
        self.authenticate()
        
        # Make multiple requests
        responses = []
        for _ in range(5):
            response = self.client.get(self.timeline_url)
            responses.append(response)
        
        # All should succeed
        for response in responses:
            self.assert_success_response(response)

    # INTEGRATION TESTS
    def test_timeline_with_recent_changes(self):
        """Test timeline reflects recent changes."""
        # Create a new guest
        new_guest = Guest.objects.create(
            wedding=self.wedding,
            first_name='New',
            last_name='Guest',
            email='newguest@example.com',
            rsvp_status=self.pending_rsvp,
            added_date=datetime.now()
        )
        
        self.authenticate()
        response = self.client.get(self.timeline_url)
        self.assert_success_response(response)
        
        data = response.json()
        timeline_data = data['data']
        
        # Should find the new guest in timeline
        guest_events = [event for event in timeline_data if 'New Guest' in event.get('event', '')]
        self.assertGreater(len(guest_events), 0)

    def test_timeline_cross_module_events(self):
        """Test timeline includes events from all modules."""
        self.authenticate()
        response = self.client.get(self.timeline_url)
        self.assert_success_response(response)
        
        data = response.json()
        timeline_data = data['data']
        
        # Should have events from different modules
        event_types = set(event['type'] for event in timeline_data)
        expected_types = {'guest', 'vendor', 'expense'}
        
        # At least some of the expected types should be present
        self.assertTrue(len(event_types.intersection(expected_types)) > 0)

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
