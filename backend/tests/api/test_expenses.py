"""
Comprehensive tests for the expenses module API endpoints.
"""

import pytest
from django.urls import reverse
from rest_framework import status
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

from tests.factories import (
    UserFactory, WeddingFactory, ExpenseFactory, BudgetCategoryFactory,
    ExpenseStatusFactory
)
from tests.conftest import BaseTestCase


@pytest.mark.django_db
class TestExpenseStatusViewSet(BaseTestCase):
    """Test ExpenseStatus ViewSet endpoints."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
    
    def test_list_expense_statuses_success(self):
        """Test listing expense statuses."""
        ExpenseStatusFactory.create_batch(3)
        
        response = self.client.get('/api/expenses/statuses/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expense statuses retrieved successfully"
        assert len(response_data['data']) == 3
    
    def test_create_expense_status_success(self):
        """Test creating an expense status."""
        data = {
            'name': 'Pending',
            'description': 'Payment pending',
            'color': '#FF0000',
            'is_paid_status': False
        }
        
        response = self.client.post('/api/expenses/statuses/', data)
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "Expense status created successfully"
        assert response_data['data']['name'] == 'Pending'
    
    def test_retrieve_expense_status_success(self):
        """Test retrieving a specific expense status."""
        expense_status = ExpenseStatusFactory()
        
        response = self.client.get(f'/api/expenses/statuses/{expense_status.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expense status retrieved successfully"
        assert response_data['data']['id'] == expense_status.id
    
    def test_update_expense_status_success(self):
        """Test updating an expense status."""
        expense_status = ExpenseStatusFactory()
        data = {
            'name': 'Updated Status',
            'description': 'Updated description'
        }
        
        response = self.client.patch(f'/api/expenses/statuses/{expense_status.id}/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expense status updated successfully"
        assert response_data['data']['name'] == 'Updated Status'
    
    def test_delete_expense_status_success(self):
        """Test deleting an expense status."""
        expense_status = ExpenseStatusFactory()
        
        response = self.client.delete(f'/api/expenses/statuses/{expense_status.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expense status deleted successfully"
    
    def test_list_expense_statuses_unauthenticated(self):
        """Test listing expense statuses without authentication."""
        self.client.credentials()  # Remove authentication
        
        response = self.client.get('/api/expenses/statuses/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestBudgetCategoryViewSet(BaseTestCase):
    """Test BudgetCategory ViewSet endpoints."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
    
    def test_list_budget_categories_success(self):
        """Test listing budget categories."""
        BudgetCategoryFactory.create_batch(3, wedding=self.wedding)
        
        response = self.client.get('/api/expenses/budget-categories/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Budget categories retrieved successfully"
        assert len(response_data['data']) == 3
    
    def test_create_budget_category_success(self):
        """Test creating a budget category."""
        data = {
            'name': 'Catering',
            'description': 'Food and drinks',
            'budget_amount': '5000.00',
            'color': '#00FF00'
        }
        
        response = self.client.post('/api/expenses/budget-categories/', data)
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "Budget category created successfully"
        assert response_data['data']['name'] == 'Catering'
        assert response_data['data']['budget_amount'] == '5000.00'
    
    def test_create_budget_category_invalid_data(self):
        """Test creating budget category with invalid data."""
        data = {
            'name': '',
            'budget_amount': 'invalid_amount'
        }
        
        response = self.client.post('/api/expenses/budget-categories/', data)
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
    
    def test_retrieve_budget_category_success(self):
        """Test retrieving a specific budget category."""
        category = BudgetCategoryFactory(wedding=self.wedding)
        
        response = self.client.get(f'/api/expenses/budget-categories/{category.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Budget category retrieved successfully"
        assert response_data['data']['id'] == category.id
    
    def test_update_budget_category_success(self):
        """Test updating a budget category."""
        category = BudgetCategoryFactory(wedding=self.wedding)
        data = {
            'name': 'Updated Category',
            'budget_amount': '6000.00'
        }
        
        response = self.client.patch(f'/api/expenses/budget-categories/{category.id}/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Budget category updated successfully"
        assert response_data['data']['name'] == 'Updated Category'
    
    def test_delete_budget_category_success(self):
        """Test deleting a budget category."""
        category = BudgetCategoryFactory(wedding=self.wedding)
        
        response = self.client.delete(f'/api/expenses/budget-categories/{category.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Budget category deleted successfully"
    
    def test_other_user_budget_category_inaccessible(self):
        """Test that user cannot access another user's budget categories."""
        other_user = UserFactory()
        other_wedding = WeddingFactory(user=other_user)
        other_category = BudgetCategoryFactory(wedding=other_wedding)
        
        response = self.client.get(f'/api/expenses/budget-categories/{other_category.id}/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestExpenseViewSet(BaseTestCase):
    """Test Expense ViewSet endpoints."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        self.category = BudgetCategoryFactory(wedding=self.wedding)
        self.status = ExpenseStatusFactory()
    
    def test_list_expenses_success(self):
        """Test listing expenses."""
        ExpenseFactory.create_batch(5, wedding=self.wedding)
        
        response = self.client.get('/api/expenses/expenses/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expenses retrieved successfully"
        assert len(response_data['data']) == 5
    
    def test_create_expense_success(self):
        """Test creating an expense."""
        data = {
            'title': 'Test Expense',
            'description': 'Test description',
            'estimated_cost': '1000.00',
            'actual_cost': '1200.00',
            'due_date': (timezone.now() + timedelta(days=30)).date(),
            'budget_category': self.category.id,
            'status': self.status.id
        }
        
        response = self.client.post('/api/expenses/expenses/', data)
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "Expense created successfully"
        assert response_data['data']['title'] == 'Test Expense'
        assert response_data['data']['estimated_cost'] == '1000.00'
    
    def test_create_expense_invalid_data(self):
        """Test creating expense with invalid data."""
        data = {
            'title': '',
            'estimated_cost': 'invalid_amount'
        }
        
        response = self.client.post('/api/expenses/expenses/', data)
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
    
    def test_retrieve_expense_success(self):
        """Test retrieving a specific expense."""
        expense = ExpenseFactory(wedding=self.wedding)
        
        response = self.client.get(f'/api/expenses/expenses/{expense.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expense retrieved successfully"
        assert response_data['data']['id'] == expense.id
    
    def test_update_expense_success(self):
        """Test updating an expense."""
        expense = ExpenseFactory(wedding=self.wedding)
        data = {
            'title': 'Updated Expense',
            'actual_cost': '1500.00'
        }
        
        response = self.client.patch(f'/api/expenses/expenses/{expense.id}/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expense updated successfully"
        assert response_data['data']['title'] == 'Updated Expense'
    
    def test_delete_expense_success(self):
        """Test deleting an expense."""
        expense = ExpenseFactory(wedding=self.wedding)
        
        response = self.client.delete(f'/api/expenses/expenses/{expense.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expense deleted successfully"
    
    def test_bulk_payment_update_success(self):
        """Test bulk payment update action."""
        expenses = ExpenseFactory.create_batch(3, wedding=self.wedding)
        expense_ids = [expense.id for expense in expenses]
        
        data = {
            'expense_ids': expense_ids,
            'paid_amount': '1000.00',
            'status_id': self.status.id,
            'paid_date': timezone.now().date()
        }
        
        response = self.client.post('/api/expenses/expenses/bulk_payment_update/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Updated 3 expenses successfully"
        assert response_data['data']['updated_count'] == 3
    
    def test_bulk_payment_update_missing_fields(self):
        """Test bulk payment update with missing required fields."""
        data = {
            'expense_ids': [1, 2, 3]
        }
        
        response = self.client.post('/api/expenses/expenses/bulk_payment_update/', data)
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
        response_data = response.json()
        assert response_data['success'] is False
        assert "Missing required fields" in response_data['errors'][0]
    
    def test_other_user_expense_inaccessible(self):
        """Test that user cannot access another user's expenses."""
        other_user = UserFactory()
        other_wedding = WeddingFactory(user=other_user)
        other_expense = ExpenseFactory(wedding=other_wedding)
        
        response = self.client.get(f'/api/expenses/expenses/{other_expense.id}/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestExpenseListCreateView(BaseTestCase):
    """Test legacy expense list and create endpoints."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
    
    def test_list_expenses_legacy_success(self):
        """Test listing expenses through legacy endpoint."""
        ExpenseFactory.create_batch(3, wedding=self.wedding)
        
        response = self.client.get('/api/expenses/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expenses retrieved successfully"
        assert len(response_data['data']) == 3
    
    def test_create_expense_legacy_success(self):
        """Test creating expense through legacy endpoint."""
        data = {
            'title': 'Legacy Expense',
            'estimated_cost': '500.00'
        }
        
        response = self.client.post('/api/expenses/', data)
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "Expense created successfully"
        assert response_data['data']['title'] == 'Legacy Expense'


@pytest.mark.django_db
class TestExpenseDetailView(BaseTestCase):
    """Test legacy expense detail endpoints."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        self.expense = ExpenseFactory(wedding=self.wedding)
    
    def test_retrieve_expense_legacy_success(self):
        """Test retrieving expense through legacy endpoint."""
        response = self.client.get(f'/api/expenses/{self.expense.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expense retrieved successfully"
        assert response_data['data']['id'] == self.expense.id
    
    def test_update_expense_legacy_success(self):
        """Test updating expense through legacy endpoint."""
        data = {
            'title': 'Updated Legacy Expense'
        }
        
        response = self.client.patch(f'/api/expenses/{self.expense.id}/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expense updated successfully"
        assert response_data['data']['title'] == 'Updated Legacy Expense'
    
    def test_delete_expense_legacy_success(self):
        """Test deleting expense through legacy endpoint."""
        response = self.client.delete(f'/api/expenses/{self.expense.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expense deleted successfully"


@pytest.mark.django_db
class TestExpenseBulkPaymentUpdate(BaseTestCase):
    """Test expense bulk payment update endpoint."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        self.expenses = ExpenseFactory.create_batch(3, wedding=self.wedding)
    
    def test_bulk_payment_update_success(self):
        """Test bulk payment update endpoint."""
        expense_ids = [expense.id for expense in self.expenses]
        
        data = {
            'expense_ids': expense_ids,
            'payment_status': 'paid',
            'paid_date': timezone.now().date()
        }
        
        response = self.client.post('/api/expenses/bulk-payment-update/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Updated 3 expenses successfully"
        assert response_data['data']['updated_count'] == 3
    
    def test_bulk_payment_update_missing_fields(self):
        """Test bulk payment update with missing fields."""
        data = {
            'expense_ids': [1, 2, 3]
        }
        
        response = self.client.post('/api/expenses/bulk-payment-update/', data)
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)


@pytest.mark.django_db
class TestExpenseStatistics(BaseTestCase):
    """Test expense statistics endpoint."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        ExpenseFactory.create_batch(5, wedding=self.wedding)
    
    def test_get_expense_statistics_success(self):
        """Test getting expense statistics."""
        response = self.client.get('/api/expenses/statistics/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Statistics retrieved successfully"
        stats = response_data['data']
        assert 'total_expenses' in stats
        assert 'total_estimated' in stats
        assert 'total_actual' in stats
        assert 'by_payment_status' in stats
        assert 'by_category' in stats
        assert stats['total_expenses'] == 5
    
    def test_get_expense_statistics_no_wedding(self):
        """Test getting statistics without wedding."""
        # Delete wedding to test fallback
        self.wedding.delete()
        
        response = self.client.get('/api/expenses/statistics/')
        
        self.assert_success_response(response)
        response_data = response.json()
        stats = response_data['data']
        assert stats['total_expenses'] == 0
        assert stats['total_estimated'] == 0


@pytest.mark.django_db
class TestExpenseOverdue(BaseTestCase):
    """Test expense overdue endpoint."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        # Create overdue expense
        ExpenseFactory(
            wedding=self.wedding,
            due_date=timezone.now().date() - timedelta(days=10),
            payment_status='pending'
        )
        # Create upcoming expense
        ExpenseFactory(
            wedding=self.wedding,
            due_date=timezone.now().date() + timedelta(days=10),
            payment_status='pending'
        )
    
    def test_get_overdue_expenses_success(self):
        """Test getting overdue expenses."""
        response = self.client.get('/api/expenses/overdue/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Overdue expenses retrieved successfully"
        # Should only return the overdue expense
        assert len(response_data['data']) == 1


@pytest.mark.django_db
class TestExpenseUpcoming(BaseTestCase):
    """Test expense upcoming endpoint."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        # Create upcoming expense (within 30 days)
        ExpenseFactory(
            wedding=self.wedding,
            due_date=timezone.now().date() + timedelta(days=15),
            payment_status='pending'
        )
        # Create far future expense (beyond 30 days)
        ExpenseFactory(
            wedding=self.wedding,
            due_date=timezone.now().date() + timedelta(days=45),
            payment_status='pending'
        )
    
    def test_get_upcoming_expenses_success(self):
        """Test getting upcoming expenses."""
        response = self.client.get('/api/expenses/upcoming/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Upcoming expenses retrieved successfully"
        # Should only return expenses within 30 days
        assert len(response_data['data']) == 1


@pytest.mark.django_db
class TestExpenseSummary(BaseTestCase):
    """Test expense summary endpoint."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        ExpenseFactory.create_batch(3, wedding=self.wedding)
    
    def test_get_expense_summary_success(self):
        """Test getting expense summary."""
        response = self.client.get('/api/expenses/summary/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Expense summary retrieved successfully"
        summary = response_data['data']
        assert 'recent_expenses' in summary
        assert 'upcoming_payments' in summary
        assert len(summary['recent_expenses']) <= 5
    
    def test_get_expense_summary_no_wedding(self):
        """Test getting summary without wedding."""
        self.wedding.delete()
        
        response = self.client.get('/api/expenses/summary/')
        
        self.assert_success_response(response)
        response_data = response.json()
        summary = response_data['data']
        assert summary['recent_expenses'] == []
        assert summary['upcoming_payments'] == []


@pytest.mark.django_db
class TestExpenseFiltering(BaseTestCase):
    """Test expense filtering and search functionality."""
    
    def setUp(self):
        super().setUp()
        self.wedding = WeddingFactory(user=self.user)
        self.category1 = BudgetCategoryFactory(wedding=self.wedding, name='Catering')
        self.category2 = BudgetCategoryFactory(wedding=self.wedding, name='Venue')
        self.status1 = ExpenseStatusFactory(name='Pending')
        self.status2 = ExpenseStatusFactory(name='Paid')
        
        # Create expenses with different attributes
        ExpenseFactory(
            wedding=self.wedding,
            title='Catering Service',
            budget_category=self.category1,
            status=self.status1
        )
        ExpenseFactory(
            wedding=self.wedding,
            title='Venue Rental',
            budget_category=self.category2,
            status=self.status2
        )
        ExpenseFactory(
            wedding=self.wedding,
            title='Flower Arrangement',
            budget_category=self.category1,
            status=self.status1
        )
    
    def test_filter_by_category(self):
        """Test filtering expenses by category."""
        response = self.client.get(f'/api/expenses/expenses/?budget_category={self.category1.id}')
        
        self.assert_success_response(response)
        response_data = response.json()
        expenses = response_data['data']
        assert len(expenses) == 2
        assert all(exp['budget_category'] == self.category1.id for exp in expenses)
    
    def test_filter_by_status(self):
        """Test filtering expenses by status."""
        response = self.client.get(f'/api/expenses/expenses/?status={self.status1.id}')
        
        self.assert_success_response(response)
        response_data = response.json()
        expenses = response_data['data']
        assert len(expenses) == 2
        assert all(exp['status'] == self.status1.id for exp in expenses)
    
    def test_search_by_title(self):
        """Test searching expenses by title."""
        response = self.client.get('/api/expenses/expenses/?search=Catering')
        
        self.assert_success_response(response)
        response_data = response.json()
        expenses = response_data['data']
        assert len(expenses) == 1
        assert 'Catering' in expenses[0]['title']
    
    def test_ordering_by_date(self):
        """Test ordering expenses by date."""
        response = self.client.get('/api/expenses/expenses/?ordering=expense_date')
        
        self.assert_success_response(response)
        response_data = response.json()
        expenses = response_data['data']
        # Verify ordering (should be ascending)
        dates = [exp['expense_date'] for exp in expenses]
        assert dates == sorted(dates)
