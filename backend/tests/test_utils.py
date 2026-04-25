"""
Test utilities and helper functions for API testing.
"""

import json
from datetime import date, datetime, timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from weddings.models import Wedding, WeddingStatus, Venue, VenueCatalog
from guests.models import Guest, RsvpStatus
from vendors.models import Vendor, VendorStatus, VendorCatalog as VendorCatalogModel, VendorCategory
from expenses.models import Expense, ExpenseStatus, BudgetCategory

User = get_user_model()


class APITestCase(TestCase):
    """Base test case for API testing with common utilities."""
    
    def setUp(self):
        """Set up test data for API tests."""
        self.client = APIClient()
        
        # Create test users
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='otherpass123',
            first_name='Other',
            last_name='User'
        )
        
        # Create authentication tokens
        self.token = Token.objects.create(user=self.user)
        self.other_token = Token.objects.create(user=self.other_user)
        
        # Set up wedding statuses (use get_or_create to avoid conflicts with migrations)
        self.planning_status, _ = WeddingStatus.objects.get_or_create(name='planning')
        self.completed_status, _ = WeddingStatus.objects.get_or_create(name='completed')
        
        # Set up RSVP statuses
        self.pending_rsvp, _ = RsvpStatus.objects.get_or_create(name='pending')
        self.confirmed_rsvp, _ = RsvpStatus.objects.get_or_create(name='confirmed')
        self.declined_rsvp, _ = RsvpStatus.objects.get_or_create(name='declined')
        
        # Set up vendor statuses
        self.pending_vendor, _ = VendorStatus.objects.get_or_create(name='pending')
        self.confirmed_vendor, _ = VendorStatus.objects.get_or_create(name='confirmed')
        self.contacted_vendor, _ = VendorStatus.objects.get_or_create(name='contacted')
        
        # Set up expense statuses
        self.pending_expense, _ = ExpenseStatus.objects.get_or_create(name='pending')
        self.paid_expense, _ = ExpenseStatus.objects.get_or_create(name='paid')
        
        # Create test wedding for main user
        self.wedding = Wedding.objects.create(
            user=self.user,
            wedding_date=date.today() + timedelta(days=30),
            theme='Garden Romance',
            status=self.planning_status
        )
        
        # Create test wedding for other user
        self.other_wedding = Wedding.objects.create(
            user=self.other_user,
            wedding_date=date.today() + timedelta(days=60),
            theme='Beach Wedding',
            status=self.planning_status
        )
        
        # Create venue catalog
        self.venue_catalog = VenueCatalog.objects.create(
            name='Garden Paradise Venue',
            type='garden',
            address='123 Garden Lane, Bloomfield, NJ 07003',
            capacity_min=50,
            capacity_max=200,
            price='5000.00',
            rating=4.8
        )
        
        # Create venue (without wedding field)
        self.venue = Venue.objects.create(
            venue_catalog=self.venue_catalog
        )
        
        # Create vendor category first (use get_or_create to avoid conflicts with migrations)
        self.vendor_category, _ = VendorCategory.objects.get_or_create(name='Photography')
        
        # Create vendor catalog
        self.vendor_catalog = VendorCatalogModel.objects.create(
            name='Perfect Photography',
            contact='John Doe - 555-0123',
            price_range='2000.00',
            rating=4.9,
            category=self.vendor_category
        )
        
        # Create vendor
        self.vendor = Vendor.objects.create(
            wedding=self.wedding,
            vendor_catalog=self.vendor_catalog,
            status=self.pending_vendor,
            cost_estimate='2500.00',
            actual_cost='2200.00'
        )
        
        # Create budget category
        self.budget_category = BudgetCategory.objects.create(
            wedding=self.wedding,
            name='Photography',
            allocated_amount='3000.00'
        )
        
        # Create expense
        self.expense = Expense.objects.create(
            wedding=self.wedding,
            budget_category=self.budget_category,
            vendor=self.vendor,
            status=self.pending_expense,
            title='Photography Package',
            amount='2500.00',
            paid_amount='1000.00',
            expense_date=date.today(),
            due_date=date.today() + timedelta(days=7)
        )
        
        # Create guest
        self.guest = Guest.objects.create(
            wedding=self.wedding,
            first_name='John',
            last_name='Doe',
            email='john.doe@example.com',
            phone='555-0123',
            relationship='family',
            rsvp_status=self.pending_rsvp,
            added_date=datetime.now()
        )
    
    def authenticate(self, token=None):
        """Authenticate client with token."""
        token = token or self.token
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    
    def authenticate_other_user(self):
        """Authenticate client with other user's token."""
        self.authenticate(self.other_token)
    
    def unauthenticate(self):
        """Remove authentication credentials."""
        self.client.credentials()
    
    def assert_success_response(self, response, expected_data=None, message=None):
        """Assert that response is a successful API response."""
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get('success', False), f"Expected success=True, got success={data.get('success')}")
        self.assertIn('data', data)
        self.assertIn('message', data)
        
        if expected_data:
            self.assertEqual(data['data'], expected_data)
        
        if message:
            self.assertEqual(data['message'], message)
    
    def assert_error_response(self, response, expected_status_code, expected_error_code, expected_message=None):
        """Assert that response is an error API response."""
        self.assertEqual(response.status_code, expected_status_code)
        data = response.json()
        self.assertFalse(data.get('success', True), f"Expected success=False, got success={data.get('success')}")
        self.assertIn('error', data)
        
        error = data['error']
        self.assertEqual(error.get('code'), expected_error_code)
        
        if expected_message:
            self.assertIn(expected_message, error.get('message', ''))
    
    def assert_created_response(self, response, expected_data=None, message=None):
        """Assert that response is a created API response."""
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertTrue(data.get('success', False))
        self.assertIn('data', data)
        self.assertIn('message', data)
        
        if expected_data:
            self.assertEqual(data['data'], expected_data)
        
        if message:
            self.assertEqual(data['message'], message)
    
    def assert_not_found_response(self, response, resource_name=None):
        """Assert that response is a not found error."""
        expected_message = f"{resource_name} not found" if resource_name else "Resource not found"
        self.assert_error_response(response, 404, "NOT_FOUND", expected_message)
    
    def assert_forbidden_response(self, response, message=None):
        """Assert that response is a forbidden error."""
        expected_message = message or "Access denied"
        self.assert_error_response(response, 403, "FORBIDDEN", expected_message)
    
    def assert_unauthorized_response(self, response, message=None):
        """Assert that response is an unauthorized error."""
        expected_message = message or "Authentication required"
        self.assert_error_response(response, 401, "UNAUTHORIZED", expected_message)
    
    def assert_validation_error_response(self, response, expected_fields=None):
        """Assert that response is a validation error."""
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "validation failed")
        
        if expected_fields:
            data = response.json()
            error_details = data.get('error', {}).get('details', {})
            for field in expected_fields:
                self.assertIn(field, error_details, f"Expected field '{field}' in validation errors")


class TestDataFactory:
    """Factory class for creating test data."""
    
    @staticmethod
    def create_wedding_data(**overrides):
        """Create wedding test data."""
        default_data = {
            'wedding_date': (date.today() + timedelta(days=30)).isoformat(),
            'theme': 'Test Wedding Theme'
        }
        default_data.update(overrides)
        return default_data
    
    @staticmethod
    def create_guest_data(**overrides):
        """Create guest test data."""
        default_data = {
            'first_name': 'Test',
            'last_name': 'Guest',
            'email': 'test.guest@example.com',
            'phone': '555-0123',
            'relationship': 'family',
            'address': '123 Test St',
            'dietary_restrictions': 'None',
            'notes': 'Test guest'
        }
        default_data.update(overrides)
        return default_data
    
    @staticmethod
    def create_vendor_data(**overrides):
        """Create vendor test data."""
        default_data = {
            'vendor_catalog': 1,
            'status': 'pending',
            'cost_estimate': '1000.00',
            'actual_cost': '1200.00'
        }
        default_data.update(overrides)
        return default_data
    
    @staticmethod
    def create_expense_data(**overrides):
        """Create expense test data."""
        default_data = {
            'budget_category': 1,
            'vendor': 1,
            'status': 'pending',
            'title': 'Test Expense',
            'amount': '500.00',
            'paid_amount': '0.00',
            'expense_date': date.today().isoformat(),
            'due_date': (date.today() + timedelta(days=7)).isoformat(),
            'notes': 'Test expense notes'
        }
        default_data.update(overrides)
        return default_data


class APIEndpointTester:
    """Helper class for testing API endpoints systematically."""
    
    def __init__(self, test_case, base_url):
        self.test_case = test_case
        self.base_url = base_url
    
    def test_list_endpoint(self, authenticate=True, expected_count=None):
        """Test list endpoint."""
        if authenticate:
            self.test_case.authenticate()
        
        response = self.test_case.client.get(self.base_url)
        
        if authenticate:
            self.test_case.assert_success_response(response)
            if expected_count is not None:
                data = response.json()
                results = data['data']
                if isinstance(results, list):
                    self.test_case.assertEqual(len(results), expected_count)
                elif 'results' in results:
                    self.test_case.assertEqual(len(results['results']), expected_count)
        else:
            self.test_case.assert_unauthorized_response(response)
    
    def test_retrieve_endpoint(self, obj_id, authenticate=True, should_exist=True):
        """Test retrieve endpoint."""
        if authenticate:
            self.test_case.authenticate()
        
        response = self.test_case.client.get(f"{self.base_url}{obj_id}/")
        
        if authenticate:
            if should_exist:
                self.test_case.assert_success_response(response)
                data = response.json()
                self.test_case.assertEqual(data['data']['id'], obj_id)
            else:
                self.test_case.assert_not_found_response(response)
        else:
            self.test_case.assert_unauthorized_response(response)
    
    def test_create_endpoint(self, data, authenticate=True, should_succeed=True):
        """Test create endpoint."""
        if authenticate:
            self.test_case.authenticate()
        
        response = self.test_case.client.post(self.base_url, data)
        
        if authenticate:
            if should_succeed:
                self.test_case.assert_created_response(response)
            else:
                self.test_case.assert_validation_error_response(response)
        else:
            self.test_case.assert_unauthorized_response(response)
    
    def test_update_endpoint(self, obj_id, data, authenticate=True, should_succeed=True):
        """Test update endpoint."""
        if authenticate:
            self.test_case.authenticate()
        
        response = self.test_case.client.put(f"{self.base_url}{obj_id}/", data)
        
        if authenticate:
            if should_succeed:
                self.test_case.assert_success_response(response)
            else:
                self.test_case.assert_validation_error_response(response)
        else:
            self.test_case.assert_unauthorized_response(response)
    
    def test_partial_update_endpoint(self, obj_id, data, authenticate=True, should_succeed=True):
        """Test partial update endpoint."""
        if authenticate:
            self.test_case.authenticate()
        
        response = self.test_case.client.patch(f"{self.base_url}{obj_id}/", data)
        
        if authenticate:
            if should_succeed:
                self.test_case.assert_success_response(response)
            else:
                self.test_case.assert_validation_error_response(response)
        else:
            self.test_case.assert_unauthorized_response(response)
    
    def test_delete_endpoint(self, obj_id, authenticate=True, should_succeed=True):
        """Test delete endpoint."""
        if authenticate:
            self.test_case.authenticate()
        
        response = self.test_case.client.delete(f"{self.base_url}{obj_id}/")
        
        if authenticate:
            if should_succeed:
                self.test_case.assertEqual(response.status_code, 204)
            else:
                self.test_case.assert_not_found_response(response)
        else:
            self.test_case.assert_unauthorized_response(response)
