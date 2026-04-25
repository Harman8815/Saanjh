"""
Comprehensive test cases for Expense API endpoints.
"""

from decimal import Decimal
from datetime import date, timedelta
from django.urls import reverse
from rest_framework import status
from .test_utils import APITestCase, TestDataFactory, APIEndpointTester


class ExpenseAPITestCase(APITestCase):
    """Test cases for Expense API endpoints."""

    def setUp(self):
        super().setUp()
        self.endpoint_tester = APIEndpointTester(self, '/api/expenses/')

    # LIST TESTS
    def test_expense_list_authenticated(self):
        """Test expense list endpoint with authentication."""
        self.endpoint_tester.test_list_endpoint(authenticate=True, expected_count=1)

    def test_expense_list_unauthenticated(self):
        """Test expense list endpoint without authentication."""
        self.endpoint_tester.test_list_endpoint(authenticate=False)

    def test_expense_list_empty_wedding(self):
        """Test expense list for wedding with no expenses."""
        self.expense.delete()  # Remove the test expense
        self.authenticate()
        
        response = self.client.get('/api/expenses/')
        self.assert_success_response(response)
        data = response.json()
        self.assertEqual(len(data['data']), 0)

    def test_expense_list_filter_by_status(self):
        """Test expense list filtered by status."""
        self.authenticate()
        response = self.client.get(f'/api/expenses/?status={self.pending_expense.id}')
        
        self.assert_success_response(response)
        data = response.json()
        expenses = data['data']
        
        # Should find our test expense with pending status
        self.assertGreater(len(expenses), 0)
        for expense in expenses:
            self.assertEqual(expense['status']['id'], self.pending_expense.id)

    def test_expense_list_filter_by_category(self):
        """Test expense list filtered by budget category."""
        self.authenticate()
        response = self.client.get(f'/api/expenses/?budget_category={self.budget_category.id}')
        
        self.assert_success_response(response)
        data = response.json()
        expenses = data['data']
        
        # Should find our test expense
        self.assertGreater(len(expenses), 0)
        for expense in expenses:
            self.assertEqual(expense['budget_category']['id'], self.budget_category.id)

    def test_expense_list_search_by_title(self):
        """Test expense list search by title."""
        self.authenticate()
        response = self.client.get('/api/expenses/?search=Photography')
        
        self.assert_success_response(response)
        data = response.json()
        expenses = data['data']
        
        # Should find our test expense
        self.assertGreater(len(expenses), 0)
        found_expense = next((e for e in expenses if 'Photography' in e['title']), None)
        self.assertIsNotNone(found_expense)

    # RETRIEVE TESTS
    def test_expense_retrieve_own_expense(self):
        """Test retrieving own wedding expense."""
        self.endpoint_tester.test_retrieve_endpoint(
            obj_id=self.expense.id,
            authenticate=True,
            should_exist=True
        )

    def test_expense_retrieve_other_wedding_expense_forbidden(self):
        """Test retrieving expense from other wedding should be forbidden."""
        # Create expense for other wedding
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
        response = self.client.get(f'/api/expenses/{other_expense.id}/')
        self.assert_forbidden_response(response, "You don't have permission to access this expense")

    def test_expense_retrieve_nonexistent(self):
        """Test retrieving non-existent expense."""
        self.endpoint_tester.test_retrieve_endpoint(
            obj_id=99999,
            authenticate=True,
            should_exist=False
        )

    def test_expense_retrieve_unauthenticated(self):
        """Test expense retrieve without authentication."""
        self.endpoint_tester.test_retrieve_endpoint(
            obj_id=self.expense.id,
            authenticate=False
        )

    # CREATE TESTS
    def test_expense_create_valid_data(self):
        """Test creating expense with valid data."""
        # Create new budget category
        new_category = BudgetCategory.objects.create(
            wedding=self.wedding,
            name='Catering',
            allocated_amount='5000.00'
        )
        
        expense_data = TestDataFactory.create_expense_data(
            budget_category=new_category.id,
            vendor=self.vendor.id,
            status=self.pending_expense.id,
            title='Catering Service',
            amount='3000.00',
            paid_amount='500.00'
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=expense_data,
            authenticate=True,
            should_succeed=True
        )

    def test_expense_create_minimal_data(self):
        """Test creating expense with minimal required data."""
        minimal_data = {
            'budget_category': self.budget_category.id,
            'title': 'Minimal Expense',
            'amount': '100.00'
        }
        
        self.authenticate()
        response = self.client.post('/api/expenses/', minimal_data)
        self.assert_created_response(response)

    def test_expense_create_invalid_amount(self):
        """Test creating expense with invalid amount."""
        expense_data = TestDataFactory.create_expense_data(
            amount='invalid_decimal',
            budget_category=self.budget_category.id
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=expense_data,
            authenticate=True,
            should_succeed=False
        )

    def test_expense_create_negative_amount(self):
        """Test creating expense with negative amount."""
        expense_data = TestDataFactory.create_expense_data(
            amount='-500.00',
            budget_category=self.budget_category.id
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=expense_data,
            authenticate=True,
            should_succeed=False
        )

    def test_expense_create_paid_amount_exceeds_amount(self):
        """Test creating expense where paid amount exceeds total amount."""
        expense_data = TestDataFactory.create_expense_data(
            amount='500.00',
            paid_amount='600.00',  # Exceeds total amount
            budget_category=self.budget_category.id
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=expense_data,
            authenticate=True,
            should_succeed=False
        )

    def test_expense_create_missing_required_fields(self):
        """Test creating expense with missing required fields."""
        invalid_data = {
            'title': 'Incomplete Expense',
            'notes': 'Missing required fields'
            # Missing budget_category and amount
        }
        
        self.endpoint_tester.test_create_endpoint(
            data=invalid_data,
            authenticate=True,
            should_succeed=False
        )

    def test_expense_create_invalid_status(self):
        """Test creating expense with invalid status."""
        expense_data = TestDataFactory.create_expense_data(
            status=99999,  # Invalid status ID
            budget_category=self.budget_category.id
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=expense_data,
            authenticate=True,
            should_succeed=False
        )

    def test_expense_create_unauthenticated(self):
        """Test expense creation without authentication."""
        expense_data = TestDataFactory.create_expense_data()
        
        self.endpoint_tester.test_create_endpoint(
            data=expense_data,
            authenticate=False
        )

    def test_expense_create_for_nonexistent_wedding(self):
        """Test creating expense for user with no wedding."""
        new_user = self._create_user('nouser', 'nouser@example.com')
        new_token = Token.objects.create(user=new_user)
        self.authenticate(new_token)
        
        expense_data = TestDataFactory.create_expense_data()
        response = self.client.post('/api/expenses/', expense_data)
        self.assert_error_response(response, 400, "NO_WEDDING_FOUND")

    def test_expense_create_exceeds_budget(self):
        """Test creating expense that exceeds budget category allocation."""
        # Set low budget allocation
        self.budget_category.allocated_amount = '100.00'
        self.budget_category.save()
        
        expense_data = TestDataFactory.create_expense_data(
            amount='500.00',  # Exceeds budget
            budget_category=self.budget_category.id
        )
        
        self.authenticate()
        response = self.client.post('/api/expenses/', expense_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Budget exceeded")

    # UPDATE TESTS
    def test_expense_update_valid_data(self):
        """Test updating expense with valid data."""
        update_data = TestDataFactory.create_expense_data(
            status=self.paid_expense.id,
            amount='3000.00',
            paid_amount='3000.00',
            title='Updated Photography Package'
        )
        
        self.endpoint_tester.test_update_endpoint(
            obj_id=self.expense.id,
            data=update_data,
            authenticate=True,
            should_succeed=True
        )

    def test_expense_update_partial_fields(self):
        """Test updating expense with partial fields."""
        partial_data = {
            'paid_amount': '1500.00',
            'notes': 'Updated expense notes',
            'due_date': (date.today() + timedelta(days=14)).isoformat()
        }
        
        self.endpoint_tester.test_partial_update_endpoint(
            obj_id=self.expense.id,
            data=partial_data,
            authenticate=True,
            should_succeed=True
        )

    def test_expense_update_status_transition(self):
        """Test expense status transitions."""
        # Transition from pending to paid
        update_data = {
            'status': self.paid_expense.id,
            'paid_amount': '2500.00',
            'paid_date': date.today().isoformat()
        }
        
        self.authenticate()
        response = self.client.patch(f'/api/expenses/{self.expense.id}/', update_data)
        self.assert_success_response(response)
        
        # Verify the update
        self.expense.refresh()
        self.assertEqual(self.expense.status.id, self.paid_expense.id)

    def test_expense_update_other_wedding_expense_forbidden(self):
        """Test updating expense from other wedding should be forbidden."""
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
        
        update_data = TestDataFactory.create_expense_data(title='Hacked Expense')
        
        self.authenticate()
        response = self.client.patch(f'/api/expenses/{other_expense.id}/', update_data)
        self.assert_forbidden_response(response)

    def test_expense_update_invalid_amount(self):
        """Test updating expense with invalid amount."""
        update_data = {
            'amount': 'invalid_decimal'
        }
        
        self.endpoint_tester.test_partial_update_endpoint(
            obj_id=self.expense.id,
            data=update_data,
            authenticate=True,
            should_succeed=False
        )

    def test_expense_update_unauthenticated(self):
        """Test expense update without authentication."""
        update_data = TestDataFactory.create_expense_data(title='Unauthorized Update')
        
        self.endpoint_tester.test_partial_update_endpoint(
            obj_id=self.expense.id,
            data=update_data,
            authenticate=False
        )

    # DELETE TESTS
    def test_expense_delete_own_expense(self):
        """Test deleting own wedding expense."""
        self.endpoint_tester.test_delete_endpoint(
            obj_id=self.expense.id,
            authenticate=True,
            should_succeed=True
        )

    def test_expense_delete_other_wedding_expense_forbidden(self):
        """Test deleting expense from other wedding should be forbidden."""
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
        response = self.client.delete(f'/api/expenses/{other_expense.id}/')
        self.assert_forbidden_response(response)

    def test_expense_delete_nonexistent(self):
        """Test deleting non-existent expense."""
        self.endpoint_tester.test_delete_endpoint(
            obj_id=99999,
            authenticate=True,
            should_succeed=False
        )

    def test_expense_delete_unauthenticated(self):
        """Test expense deletion without authentication."""
        self.endpoint_tester.test_delete_endpoint(
            obj_id=self.expense.id,
            authenticate=False
        )

    # EXPENSE PAYMENT TESTS
    def test_expense_record_payment(self):
        """Test recording payment for expense."""
        payment_data = {
            'amount': '500.00',
            'payment_date': date.today().isoformat(),
            'payment_method': 'credit_card',
            'notes': 'Partial payment'
        }
        
        self.authenticate()
        response = self.client.post(f'/api/expenses/{self.expense.id}/pay/', payment_data)
        self.assert_success_response(response, message="Payment recorded successfully")
        
        # Verify payment was recorded
        self.expense.refresh()
        expected_paid = Decimal('1000.00') + Decimal('500.00')  # Original + new payment
        self.assertEqual(self.expense.paid_amount, expected_paid)

    def test_expense_payment_exceeds_amount(self):
        """Test payment that exceeds expense amount."""
        payment_data = {
            'amount': '2000.00',  # Exceeds remaining balance
            'payment_date': date.today().isoformat()
        }
        
        self.authenticate()
        response = self.client.post(f'/api/expenses/{self.expense.id}/pay/', payment_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Payment exceeds expense amount")

    def test_expense_full_payment(self):
        """Test full payment of expense."""
        remaining_balance = self.expense.amount - self.expense.paid_amount
        payment_data = {
            'amount': str(remaining_balance),
            'payment_date': date.today().isoformat()
        }
        
        self.authenticate()
        response = self.client.post(f'/api/expenses/{self.expense.id}/pay/', payment_data)
        self.assert_success_response(response, message="Payment recorded successfully")
        
        # Verify expense is fully paid
        self.expense.refresh()
        self.assertEqual(self.expense.paid_amount, self.expense.amount)
        self.assertEqual(self.expense.status.id, self.paid_expense.id)

    # BUDGET CATEGORY TESTS
    def test_budget_category_list(self):
        """Test budget category list endpoint."""
        self.authenticate()
        response = self.client.get('/api/expenses/budget-categories/')
        
        self.assert_success_response(response, message="Budget categories retrieved successfully")
        data = response.json()
        categories = data['data']
        
        # Should include our test category
        category_ids = [category['id'] for category in categories]
        self.assertIn(self.budget_category.id, category_ids)

    def test_budget_category_create(self):
        """Test creating budget category."""
        category_data = {
            'name': 'Entertainment',
            'allocated_amount': '2000.00'
        }
        
        self.authenticate()
        response = self.client.post('/api/expenses/budget-categories/', category_data)
        self.assert_created_response(response, message="Budget category created successfully")

    def test_budget_category_update(self):
        """Test updating budget category."""
        update_data = {
            'allocated_amount': '3500.00'
        }
        
        self.authenticate()
        response = self.client.patch(f'/api/expenses/budget-categories/{self.budget_category.id}/', update_data)
        self.assert_success_response(response, message="Budget category updated successfully")
        
        # Verify update
        self.budget_category.refresh()
        self.assertEqual(str(self.budget_category.allocated_amount), '3500.00')

    # EXPENSE STATISTICS TESTS
    def test_expense_statistics(self):
        """Test expense statistics endpoint."""
        self.authenticate()
        response = self.client.get('/api/expenses/statistics/')
        
        self.assert_success_response(response, message="Expense statistics retrieved successfully")
        data = response.json()
        stats = data['data']
        
        # Check required statistics
        self.assertIn('total_estimated', stats)
        self.assertIn('total_actual', stats)
        self.assertIn('total_paid', stats)
        self.assertIn('remaining', stats)
        self.assertIn('budget_used', stats)
        self.assertIn('by_category', stats)
        self.assertIn('by_status', stats)

    def test_expense_budget_analysis(self):
        """Test expense budget analysis endpoint."""
        self.authenticate()
        response = self.client.get('/api/expenses/budget-analysis/')
        
        self.assert_success_response(response, message="Budget analysis retrieved successfully")
        data = response.json()
        analysis = data['data']
        
        # Check analysis fields
        self.assertIn('total_allocated', analysis)
        self.assertIn('total_spent', analysis)
        self.assertIn('total_remaining', analysis)
        self.assertIn('over_budget_categories', analysis)
        self.assertIn('under_budget_categories', analysis)

    # EXPENSE REPORTS TESTS
    def test_expense_monthly_report(self):
        """Test expense monthly report."""
        self.authenticate()
        response = self.client.get('/api/expenses/reports/monthly/')
        
        self.assert_success_response(response, message="Monthly expense report generated successfully")
        data = response.json()
        report = data['data']
        
        # Check report structure
        self.assertIn('period', report)
        self.assertIn('total_expenses', report)
        self.assertIn('by_category', report)
        self.assertIn('trend', report)

    def test_expense_category_report(self):
        """Test expense category report."""
        self.authenticate()
        response = self.client.get('/api/expenses/reports/by-category/')
        
        self.assert_success_response(response, message="Category expense report generated successfully")
        data = response.json()
        report = data['data']
        
        # Check report structure
        self.assertIn('categories', report)
        self.assertIn('total_by_category', report)
        self.assertIn('budget_comparison', report)

    # EDGE CASES AND VALIDATION TESTS
    def test_expense_date_validation(self):
        """Test expense date validation."""
        future_date = (date.today() + timedelta(days=365)).isoformat()
        expense_data = TestDataFactory.create_expense_data(
            expense_date=future_date,
            budget_category=self.budget_category.id
        )
        
        self.authenticate()
        response = self.client.post('/api/expenses/', expense_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Expense date too far in future")

    def test_expense_due_date_before_expense_date(self):
        """Test due date before expense date."""
        expense_date = date.today() + timedelta(days=10)
        due_date = date.today() + timedelta(days=5)  # Before expense date
        
        expense_data = TestDataFactory.create_expense_data(
            expense_date=expense_date.isoformat(),
            due_date=due_date.isoformat(),
            budget_category=self.budget_category.id
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=expense_data,
            authenticate=True,
            should_succeed=False
        )

    def test_expense_zero_amount(self):
        """Test creating expense with zero amount."""
        expense_data = TestDataFactory.create_expense_data(
            amount='0.00',
            budget_category=self.budget_category.id
        )
        
        self.endpoint_tester.test_create_endpoint(
            data=expense_data,
            authenticate=True,
            should_succeed=False
        )

    def test_expense_concurrent_updates(self):
        """Test concurrent expense updates."""
        # First update
        update_data1 = {'notes': 'First update'}
        response1 = self.client.patch(f'/api/expenses/{self.expense.id}/', update_data1)
        self.assert_success_response(response1)
        
        # Second update
        update_data2 = {'notes': 'Second update'}
        response2 = self.client.patch(f'/api/expenses/{self.expense.id}/', update_data2)
        self.assert_success_response(response2)
        
        # Verify final state
        self.expense.refresh()
        self.assertEqual(self.expense.notes, 'Second update')

    def test_expense_api_response_format(self):
        """Test that all expense API responses follow standardized format."""
        self.authenticate()
        
        # Test list response format
        response = self.client.get('/api/expenses/')
        self._assert_standard_response_format(response)
        
        # Test retrieve response format
        response = self.client.get(f'/api/expenses/{self.expense.id}/')
        self._assert_standard_response_format(response)
        
        # Test statistics response format
        response = self.client.get('/api/expenses/statistics/')
        self._assert_standard_response_format(response)
        
        # Test budget categories response format
        response = self.client.get('/api/expenses/budget-categories/')
        self._assert_standard_response_format(response)

    # INTEGRATION TESTS
    def test_expense_vendor_relationship(self):
        """Test expense-vendor relationship operations."""
        self.authenticate()
        response = self.client.get(f'/api/expenses/{self.expense.id}/vendor/')
        
        self.assert_success_response(response, message="Vendor information retrieved successfully")
        data = response.json()
        vendor_data = data['data']
        
        self.assertEqual(vendor_data['id'], self.vendor.id)

    def test_expense_category_summary(self):
        """Test expense category summary."""
        # Create additional expense in same category
        expense2 = Expense.objects.create(
            wedding=self.wedding,
            budget_category=self.budget_category,
            status=self.pending_expense,
            title='Additional Photography Service',
            amount='500.00',
            paid_amount='0.00'
        )
        
        self.authenticate()
        response = self.client.get(f'/api/expenses/budget-categories/{self.budget_category.id}/summary/')
        
        self.assert_success_response(response, message="Category summary retrieved successfully")
        data = response.json()
        summary = data['data']
        
        # Should include both expenses
        self.assertEqual(summary['expense_count'], 2)
        self.assertEqual(summary['total_amount'], Decimal('3000.00'))  # 2500 + 500

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
