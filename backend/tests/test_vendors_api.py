"""
Comprehensive test cases for Vendor API endpoints.
"""

from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from .test_utils import APITestCase, TestDataFactory, APIEndpointTester


class VendorAPITestCase(APITestCase):
    """Test cases for Vendor API endpoints."""

    def setUp(self):
        super().setUp()
        self.endpoint_tester = APIEndpointTester(self, '/api/vendors/')

    # LIST TESTS
    def test_vendor_list_authenticated(self):
        """Test vendor list endpoint with authentication."""
        self.endpoint_tester.test_list_endpoint(authenticate=True, expected_count=1)

    def test_vendor_list_unauthenticated(self):
        """Test vendor list endpoint without authentication."""
        self.endpoint_tester.test_list_endpoint(authenticate=False)

    def test_vendor_list_empty_wedding(self):
        """Test vendor list for wedding with no vendors."""
        self.vendor.delete()  # Remove the test vendor
        self.authenticate()
        
        response = self.client.get('/api/vendors/')
        self.assert_success_response(response)
        data = response.json()
        self.assertEqual(len(data['data']), 0)

    def test_vendor_list_filter_by_status(self):
        """Test vendor list filtered by status."""
        self.authenticate()
        response = self.client.get(f'/api/vendors/?status={self.pending_vendor.id}')
        
        self.assert_success_response(response)
        data = response.json()
        vendors = data['data']
        
        # Should find our test vendor with pending status
        self.assertGreater(len(vendors), 0)
        for vendor in vendors:
            self.assertEqual(vendor['status']['id'], self.pending_vendor.id)

    def test_vendor_list_search_by_name(self):
        """Test vendor list search by name."""
        self.authenticate()
        response = self.client.get('/api/vendors/?search=Photography')
        
        self.assert_success_response(response)
        data = response.json()
        vendors = data['data']
        
        # Should find our test vendor
        self.assertGreater(len(vendors), 0)
        found_vendor = next((v for v in vendors if 'Photography' in v['vendor_catalog']['name']), None)
        self.assertIsNotNone(found_vendor)

    # RETRIEVE TESTS
    def test_vendor_retrieve_own_vendor(self):
        """Test retrieving own wedding vendor."""
        self.endpoint_tester.test_retrieve_endpoint(
            obj_id=self.vendor.id,
            authenticate=True,
            should_exist=True
        )

    def test_vendor_retrieve_other_wedding_vendor_forbidden(self):
        """Test retrieving vendor from other wedding should be forbidden."""
        # Create vendor for other wedding
        other_vendor = Vendor.objects.create(
            wedding=self.other_wedding,
            vendor_catalog=self.vendor_catalog,
            status=self.pending_vendor
        )
        
        self.authenticate()
        response = self.client.get(f'/api/vendors/{other_vendor.id}/')
        self.assert_forbidden_response(response, "You don't have permission to access this vendor")

    def test_vendor_retrieve_nonexistent(self):
        """Test retrieving non-existent vendor."""
        self.endpoint_tester.test_retrieve_endpoint(
            obj_id=99999,
            authenticate=True,
            should_exist=False
        )

    def test_vendor_retrieve_unauthenticated(self):
        """Test vendor retrieve without authentication."""
        self.endpoint_tester.test_retrieve_endpoint(
            obj_id=self.vendor.id,
            authenticate=False
        )

    # CREATE TESTS
    def test_vendor_create_valid_data(self):
        """Test creating vendor with valid data."""
        # Create new vendor catalog
        new_catalog = VendorCatalogModel.objects.create(
            name='Flower Shop',
            contact='Jane Smith - 555-0234',
            price_range='1500.00',
            rating=4.7
        )
        
        vendor_data = TestDataFactory.create_vendor_data(
            vendor_catalog=new_catalog.id,
            status=self.pending_vendor.id,
            cost_estimate='2000.00',
            actual_cost='1800.00'
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=vendor_data,
            authenticate=True,
            should_succeed=True
        )

    def test_vendor_create_minimal_data(self):
        """Test creating vendor with minimal required data."""
        # Create new vendor catalog
        new_catalog = VendorCatalogModel.objects.create(
            name='Catering Service',
            contact='Caterer - 555-0345',
            price_range='3000.00',
            rating=4.5
        )
        
        minimal_data = {
            'vendor_catalog': new_catalog.id,
            'status': self.pending_vendor.id
        }
        
        self.authenticate()
        response = self.client.post('/api/vendors/', minimal_data)
        self.assert_created_response(response)

    def test_vendor_create_invalid_cost_estimate(self):
        """Test creating vendor with invalid cost estimate."""
        vendor_data = TestDataFactory.create_vendor_data(
            cost_estimate='invalid_decimal',
            vendor_catalog=self.vendor_catalog.id
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=vendor_data,
            authenticate=True,
            should_succeed=False
        )

    def test_vendor_create_negative_amount(self):
        """Test creating vendor with negative amount."""
        vendor_data = TestDataFactory.create_vendor_data(
            cost_estimate='-1000.00',
            vendor_catalog=self.vendor_catalog.id
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=vendor_data,
            authenticate=True,
            should_succeed=False
        )

    def test_vendor_create_missing_vendor_catalog(self):
        """Test creating vendor without vendor catalog."""
        vendor_data = TestDataFactory.create_vendor_data()
        del vendor_data['vendor_catalog']
        
        self.endpoint_tester.test_create_endpoint(
            data=vendor_data,
            authenticate=True,
            should_succeed=False
        )

    def test_vendor_create_invalid_status(self):
        """Test creating vendor with invalid status."""
        vendor_data = TestDataFactory.create_vendor_data(
            status=99999,  # Invalid status ID
            vendor_catalog=self.vendor_catalog.id
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=vendor_data,
            authenticate=True,
            should_succeed=False
        )

    def test_vendor_create_unauthenticated(self):
        """Test vendor creation without authentication."""
        vendor_data = TestDataFactory.create_vendor_data()
        
        self.endpoint_tester.test_create_endpoint(
            data=vendor_data,
            authenticate=False
        )

    def test_vendor_create_for_nonexistent_wedding(self):
        """Test creating vendor for user with no wedding."""
        new_user = self._create_user('nouser', 'nouser@example.com')
        new_token = Token.objects.create(user=new_user)
        self.authenticate(new_token)
        
        vendor_data = TestDataFactory.create_vendor_data()
        response = self.client.post('/api/vendors/', vendor_data)
        self.assert_error_response(response, 400, "NO_WEDDING_FOUND")

    # UPDATE TESTS
    def test_vendor_update_valid_data(self):
        """Test updating vendor with valid data."""
        update_data = TestDataFactory.create_vendor_data(
            status=self.confirmed_vendor.id,
            cost_estimate='3000.00',
            actual_cost='2800.00'
        )
        
        self.endpoint_tester.test_update_endpoint(
            obj_id=self.vendor.id,
            data=update_data,
            authenticate=True,
            should_succeed=True
        )

    def test_vendor_update_partial_fields(self):
        """Test updating vendor with partial fields."""
        partial_data = {
            'actual_cost': '2300.00',
            'notes': 'Updated vendor notes'
        }
        
        self.endpoint_tester.test_partial_update_endpoint(
            obj_id=self.vendor.id,
            data=partial_data,
            authenticate=True,
            should_succeed=True
        )

    def test_vendor_update_status_transition(self):
        """Test vendor status transitions."""
        # Transition from pending to contacted
        update_data = {'status': self.contacted_vendor.id}
        
        self.authenticate()
        response = self.client.patch(f'/api/vendors/{self.vendor.id}/', update_data)
        self.assert_success_response(response)
        
        # Verify the update
        self.vendor.refresh()
        self.assertEqual(self.vendor.status.id, self.contacted_vendor.id)

    def test_vendor_update_other_wedding_vendor_forbidden(self):
        """Test updating vendor from other wedding should be forbidden."""
        other_vendor = Vendor.objects.create(
            wedding=self.other_wedding,
            vendor_catalog=self.vendor_catalog,
            status=self.pending_vendor
        )
        
        update_data = TestDataFactory.create_vendor_data(status=self.confirmed_vendor.id)
        
        self.authenticate()
        response = self.client.patch(f'/api/vendors/{other_vendor.id}/', update_data)
        self.assert_forbidden_response(response)

    def test_vendor_update_invalid_amount(self):
        """Test updating vendor with invalid amount."""
        update_data = {
            'cost_estimate': 'invalid_decimal'
        }
        
        self.endpoint_tester.test_partial_update_endpoint(
            obj_id=self.vendor.id,
            data=update_data,
            authenticate=True,
            should_succeed=False
        )

    def test_vendor_update_unauthenticated(self):
        """Test vendor update without authentication."""
        update_data = TestDataFactory.create_vendor_data(status=self.confirmed_vendor.id)
        
        self.endpoint_tester.test_partial_update_endpoint(
            obj_id=self.vendor.id,
            data=update_data,
            authenticate=False
        )

    # DELETE TESTS
    def test_vendor_delete_own_vendor(self):
        """Test deleting own wedding vendor."""
        self.endpoint_tester.test_delete_endpoint(
            obj_id=self.vendor.id,
            authenticate=True,
            should_succeed=True
        )

    def test_vendor_delete_other_wedding_vendor_forbidden(self):
        """Test deleting vendor from other wedding should be forbidden."""
        other_vendor = Vendor.objects.create(
            wedding=self.other_wedding,
            vendor_catalog=self.vendor_catalog,
            status=self.pending_vendor
        )
        
        self.authenticate()
        response = self.client.delete(f'/api/vendors/{other_vendor.id}/')
        self.assert_forbidden_response(response)

    def test_vendor_delete_nonexistent(self):
        """Test deleting non-existent vendor."""
        self.endpoint_tester.test_delete_endpoint(
            obj_id=99999,
            authenticate=True,
            should_succeed=False
        )

    def test_vendor_delete_unauthenticated(self):
        """Test vendor deletion without authentication."""
        self.endpoint_tester.test_delete_endpoint(
            obj_id=self.vendor.id,
            authenticate=False
        )

    # VENDOR CATALOG TESTS
    def test_vendor_catalog_list(self):
        """Test vendor catalog list endpoint."""
        self.authenticate()
        response = self.client.get('/api/vendors/catalog/')
        
        self.assert_success_response(response, message="Vendor catalog retrieved successfully")
        data = response.json()
        catalogs = data['data']
        
        # Should include our test catalog
        catalog_ids = [catalog['id'] for catalog in catalogs]
        self.assertIn(self.vendor_catalog.id, catalog_ids)

    def test_vendor_catalog_search(self):
        """Test vendor catalog search functionality."""
        self.authenticate()
        response = self.client.get('/api/vendors/catalog/?search=Photography')
        
        self.assert_success_response(response)
        data = response.json()
        catalogs = data['data']
        
        # Should find our photography catalog
        found_catalog = next((c for c in catalogs if 'Photography' in c['name']), None)
        self.assertIsNotNone(found_catalog)

    def test_vendor_catalog_filter_by_type(self):
        """Test vendor catalog filter by type."""
        # Create catalog with specific type
        new_catalog = VendorCatalogModel.objects.create(
            name='Test Florist',
            contact='Test Contact',
            price_range='1000.00',
            rating=4.0,
            type='florist'
        )
        
        self.authenticate()
        response = self.client.get('/api/vendors/catalog/?type=florist')
        
        self.assert_success_response(response)
        data = response.json()
        catalogs = data['data']
        
        # Should find florist catalogs
        for catalog in catalogs:
            self.assertEqual(catalog['type'], 'florist')

    # VENDOR STATUS MANAGEMENT TESTS
    def test_vendor_bulk_status_update(self):
        """Test bulk vendor status update."""
        # Create additional vendor
        vendor2 = Vendor.objects.create(
            wedding=self.wedding,
            vendor_catalog=self.vendor_catalog,
            status=self.pending_vendor
        )
        
        bulk_data = {
            'vendors': [
                {'id': self.vendor.id, 'status': self.confirmed_vendor.id},
                {'id': vendor2.id, 'status': self.contacted_vendor.id}
            ]
        }
        
        self.authenticate()
        response = self.client.post('/api/vendors/bulk-status/', bulk_data)
        self.assert_success_response(response, message="Vendor statuses updated successfully")
        
        # Verify updates
        self.vendor.refresh()
        vendor2.refresh()
        self.assertEqual(self.vendor.status.id, self.confirmed_vendor.id)
        self.assertEqual(vendor2.status.id, self.contacted_vendor.id)

    def test_vendor_contact_vendor(self):
        """Test contacting vendor functionality."""
        contact_data = {
            'vendor_id': self.vendor.id,
            'message': 'We would like to discuss our wedding photography services.',
            'contact_date': date.today().isoformat()
        }
        
        self.authenticate()
        response = self.client.post('/api/vendors/contact/', contact_data)
        self.assert_success_response(response, message="Vendor contacted successfully")
        
        # Verify status changed to contacted
        self.vendor.refresh()
        self.assertEqual(self.vendor.status.id, self.contacted_vendor.id)

    def test_vendor_book_vendor(self):
        """Test booking vendor functionality."""
        booking_data = {
            'vendor_id': self.vendor.id,
            'booking_date': date.today().isoformat(),
            'terms': 'Standard photography package',
            'deposit_amount': '500.00'
        }
        
        self.authenticate()
        response = self.client.post('/api/vendors/book/', booking_data)
        self.assert_success_response(response, message="Vendor booked successfully")
        
        # Verify status changed to confirmed
        self.vendor.refresh()
        self.assertEqual(self.vendor.status.id, self.confirmed_vendor.id)

    # VENDOR STATISTICS TESTS
    def test_vendor_statistics(self):
        """Test vendor statistics endpoint."""
        self.authenticate()
        response = self.client.get('/api/vendors/statistics/')
        
        self.assert_success_response(response, message="Vendor statistics retrieved successfully")
        data = response.json()
        stats = data['data']
        
        # Check required statistics
        self.assertIn('total', stats)
        self.assertIn('confirmed', stats)
        self.assertIn('pending', stats)
        self.assertIn('contacted', stats)
        self.assertIn('completed', stats)
        self.assertIn('cancelled', stats)
        
        # Verify counts
        self.assertEqual(stats['total'], 1)
        self.assertEqual(stats['pending'], 1)

    def test_vendor_cost_analysis(self):
        """Test vendor cost analysis endpoint."""
        self.authenticate()
        response = self.client.get('/api/vendors/cost-analysis/')
        
        self.assert_success_response(response, message="Cost analysis retrieved successfully")
        data = response.json()
        analysis = data['data']
        
        # Check analysis fields
        self.assertIn('total_estimated', analysis)
        self.assertIn('total_actual', analysis)
        self.assertIn('total_savings', analysis)
        self.assertIn('by_category', analysis)

    # EDGE CASES AND VALIDATION TESTS
    def test_vendor_cost_precision_validation(self):
        """Test vendor cost precision validation."""
        high_precision_data = TestDataFactory.create_vendor_data(
            cost_estimate='1234.56789',  # Too many decimal places
            vendor_catalog=self.vendor_catalog.id
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=high_precision_data,
            authenticate=True,
            should_succeed=False
        )

    def test_vendor_large_amount_validation(self):
        """Test vendor large amount validation."""
        large_amount_data = TestDataFactory.create_vendor_data(
            cost_estimate='999999999.99',  # Exceedingly large amount
            vendor_catalog=self.vendor_catalog.id
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=large_amount_data,
            authenticate=True,
            should_succeed=False
        )

    def test_vendor_duplicate_booking(self):
        """Test booking already booked vendor."""
        # Mark vendor as confirmed
        self.vendor.status = self.confirmed_vendor
        self.vendor.save()
        
        booking_data = {
            'vendor_id': self.vendor.id,
            'booking_date': date.today().isoformat()
        }
        
        self.authenticate()
        response = self.client.post('/api/vendors/book/', booking_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Vendor already booked")

    def test_vendor_concurrent_updates(self):
        """Test concurrent vendor updates."""
        # First update
        update_data1 = {'notes': 'First update'}
        response1 = self.client.patch(f'/api/vendors/{self.vendor.id}/', update_data1)
        self.assert_success_response(response1)
        
        # Second update
        update_data2 = {'notes': 'Second update'}
        response2 = self.client.patch(f'/api/vendors/{self.vendor.id}/', update_data2)
        self.assert_success_response(response2)
        
        # Verify final state
        self.vendor.refresh()
        self.assertEqual(self.vendor.notes, 'Second update')

    def test_vendor_api_response_format(self):
        """Test that all vendor API responses follow standardized format."""
        self.authenticate()
        
        # Test list response format
        response = self.client.get('/api/vendors/')
        self._assert_standard_response_format(response)
        
        # Test retrieve response format
        response = self.client.get(f'/api/vendors/{self.vendor.id}/')
        self._assert_standard_response_format(response)
        
        # Test statistics response format
        response = self.client.get('/api/vendors/statistics/')
        self._assert_standard_response_format(response)
        
        # Test catalog response format
        response = self.client.get('/api/vendors/catalog/')
        self._assert_standard_response_format(response)

    # INTEGRATION TESTS
    def test_vendor_related_expenses(self):
        """Test vendor-related expense operations."""
        # Create additional expense for the vendor
        expense2 = Expense.objects.create(
            wedding=self.wedding,
            budget_category=self.budget_category,
            vendor=self.vendor,
            status=self.pending_expense,
            title='Additional Photography Service',
            amount='500.00',
            paid_amount='0.00'
        )
        
        self.authenticate()
        response = self.client.get(f'/api/vendors/{self.vendor.id}/expenses/')
        self.assert_success_response(response, message="Vendor expenses retrieved successfully")
        
        data = response.json()
        expenses = data['data']
        self.assertEqual(len(expenses), 2)  # Original expense + new expense

    def test_vendor_timeline_events(self):
        """Test vendor timeline events."""
        self.authenticate()
        response = self.client.get(f'/api/vendors/{self.vendor.id}/timeline/')
        
        self.assert_success_response(response, message="Vendor timeline retrieved successfully")
        data = response.json()
        timeline = data['data']
        
        # Should have timeline events for vendor
        self.assertIsInstance(timeline, list)

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
