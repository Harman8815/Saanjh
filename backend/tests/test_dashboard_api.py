"""
API tests for the rewritten dashboard endpoint (GET /api/weddings/dashboard/).

The payload now carries metrics, readiness, and alerts from
utils.wedding_insights, plus the corrected expense_stats (real budget_used,
total_actual that is not a copy of total_estimated) and real vendor dates.
"""

from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from expenses.models import BudgetCategory, Expense, ExpenseStatus
from guests.models import Guest, RsvpStatus
from tasks.models import Task, TaskPriority, TaskStatus
from vendors.models import Vendor, VendorCatalog, VendorCategory, VendorStatus
from weddings.models import Wedding, WeddingStatus

User = get_user_model()

DASHBOARD_URL = '/api/weddings/dashboard/'


class DashboardAPITestCase(TestCase):
    """Authenticated dashboard endpoint tests."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='couple', email='couple@example.com', password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.other_user = User.objects.create_user(
            username='intruder', email='intruder@example.com', password='testpass123'
        )
        self.wedding = Wedding.objects.create(
            user=self.user,
            wedding_date=date.today() + timedelta(days=90),
            theme='Garden',
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )

        self.rsvp_pending = RsvpStatus.objects.get_or_create(name='pending')[0]
        self.rsvp_confirmed = RsvpStatus.objects.get_or_create(name='confirmed')[0]
        self.expense_pending = ExpenseStatus.objects.get_or_create(name='pending')[0]
        self.vendor_confirmed = VendorStatus.objects.get_or_create(name='confirmed')[0]
        self.task_todo = TaskStatus.objects.get_or_create(name='todo')[0]
        self.task_priority = TaskPriority.objects.get_or_create(name='Medium')[0]

    # -- helpers ------------------------------------------------------------

    def make_expense(self, title, amount, paid=0, due_date=None,
                     status=None, category=None):
        return Expense.objects.create(
            wedding=self.wedding,
            title=title,
            amount=amount,
            paid_amount=paid,
            status=status or self.expense_pending,
            due_date=due_date,
            budget_category=category,
            expense_date=date.today(),
        )

    def make_vendor(self, name='Studio', status=None):
        category = VendorCategory.objects.get_or_create(name='Photography')[0]
        catalog = VendorCatalog.objects.create(
            name=name, category=category, contact='studio@example.com',
            price_range='1000.00', rating=4.5,
        )
        return Vendor.objects.create(
            wedding=self.wedding,
            vendor_catalog=catalog,
            status=status or self.vendor_confirmed,
        )

    def get_dashboard(self):
        response = self.client.get(DASHBOARD_URL)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload['success'])
        return payload['data']

    # -- tests --------------------------------------------------------------

    def test_dashboard_requires_authentication(self):
        response = APIClient().get(DASHBOARD_URL)
        self.assertEqual(response.status_code, 401)

    def test_dashboard_returns_metrics_readiness_alerts_keys(self):
        data = self.get_dashboard()

        self.assertIn('metrics', data)
        self.assertIn('readiness', data)
        self.assertIn('alerts', data)
        self.assertIn('recent_activities', data)
        # Legacy keys are preserved for the pre-Phase-3 consumers.
        self.assertIn('guest_stats', data)
        self.assertIn('vendor_stats', data)
        self.assertIn('expense_stats', data)

        metrics = data['metrics']
        for key in (
            'total_budget', 'committed', 'paid', 'outstanding',
            'budget_used_pct', 'projected_final_cost',
            'tasks_completion_pct',
        ):
            self.assertIn(key, metrics)

        readiness = data['readiness']
        self.assertEqual(readiness['score'], 0.0)
        self.assertEqual(len(readiness['domains']), 5)

    def test_budget_used_is_no_longer_zero(self):
        """The old endpoint hardcoded budget_used=0; it must now be real."""
        BudgetCategory.objects.create(
            wedding=self.wedding, name='Venue', allocated_amount=10000
        )
        self.make_expense('Venue deposit', 2500, paid=1000)

        data = self.get_dashboard()

        self.assertEqual(data['metrics']['committed'], 2500)
        self.assertEqual(data['metrics']['paid'], 1000)
        self.assertEqual(data['metrics']['outstanding'], 1500)
        self.assertEqual(data['metrics']['budget_used_pct'], 25.0)
        self.assertEqual(data['expense_stats']['budget_used'], 25.0)

    def test_expense_stats_total_actual_is_paid_not_copy(self):
        """total_actual used to duplicate total_estimated; it is now the paid sum."""
        self.make_expense('Cake', 500, paid=200)

        data = self.get_dashboard()

        self.assertEqual(data['expense_stats']['total_paid'], 200)
        self.assertEqual(data['expense_stats']['total_actual'], 200)
        self.assertNotEqual(
            data['expense_stats']['total_actual'],
            data['expense_stats']['total_estimated'],
        )

    def test_recent_activity_vendors_have_real_dates(self):
        """Vendor activity dates were always None before the timestamps landed."""
        self.make_vendor('Eternal Moments')

        data = self.get_dashboard()

        vendors = data['recent_activities']['vendors']
        self.assertEqual(len(vendors), 1)
        self.assertEqual(vendors[0]['name'], 'Eternal Moments')
        self.assertIsNotNone(vendors[0]['date'])

    def test_alerts_contain_overdue_expense(self):
        self.make_expense('Final payment', 400, due_date=date.today() - timedelta(days=2))

        data = self.get_dashboard()

        alert_ids = [alert['id'] for alert in data['alerts']]
        self.assertIn('overdue-expense-1', alert_ids)
        alert = next(a for a in data['alerts'] if a['id'] == 'overdue-expense-1')
        self.assertEqual(alert['severity'], 'critical')
        self.assertEqual(alert['entity_type'], 'expense')

    def test_readiness_reflects_configured_domains(self):
        BudgetCategory.objects.create(wedding=self.wedding, name='Venue', allocated_amount=1000)
        Guest.objects.create(
            wedding=self.wedding, first_name='A', last_name='B',
            rsvp_status=self.rsvp_confirmed,
        )
        self.make_vendor()
        Task.objects.create(
            wedding=self.wedding, title='Invites', status=self.task_todo,
            priority=self.task_priority,
        )

        data = self.get_dashboard()

        domains = {domain['key']: domain for domain in data['readiness']['domains']}
        self.assertEqual(domains['budget']['pct'], 100.0)
        self.assertEqual(domains['guests']['pct'], 100.0)
        self.assertEqual(domains['vendors']['pct'], 100.0)
        self.assertEqual(domains['tasks']['pct'], 0.0)
        # venue 0, budget 15, guests 20, vendors 20, tasks 0.
        self.assertEqual(data['readiness']['score'], 55.0)

    def test_tasks_completion_pct_is_present(self):
        completed = TaskStatus.objects.get_or_create(name='Completed')[0]
        Task.objects.create(wedding=self.wedding, title='Done', status=completed,
                            priority=self.task_priority)
        Task.objects.create(wedding=self.wedding, title='Todo', status=self.task_todo,
                            priority=self.task_priority)

        data = self.get_dashboard()

        self.assertEqual(data['metrics']['tasks_completion_pct'], 50.0)

    def test_dashboard_404_for_user_without_wedding(self):
        fresh = User.objects.create_user(username='fresh', email='fresh@example.com')
        token = Token.objects.create(user=fresh)
        fresh_client = APIClient()
        fresh_client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        response = fresh_client.get(DASHBOARD_URL)

        # No wedding yet -> clean 404 from get_request_wedding semantics.
        self.assertEqual(response.status_code, 404)

    def test_dashboard_does_not_leak_other_weddings_data(self):
        other_wedding = Wedding.objects.create(
            user=self.other_user,
            wedding_date=date.today() + timedelta(days=60),
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )
        Expense.objects.create(
            wedding=other_wedding, title='Stranger expense', amount='9999.00',
            paid_amount=0, status=self.expense_pending, expense_date=date.today(),
        )

        data = self.get_dashboard()

        self.assertEqual(data['metrics']['committed'], 0)

    def test_dashboard_payload_is_json_serialisable(self):
        """Decimal/datetime values must survive the envelope as plain types."""
        BudgetCategory.objects.create(wedding=self.wedding, name='Venue', allocated_amount=1000)
        self.make_expense('Deposit', 250, paid=100)

        data = self.get_dashboard()

        self.assertIsInstance(data['metrics']['total_budget'], float)
        self.assertIsInstance(data['metrics']['committed'], float)
        self.assertIsInstance(data['readiness']['score'], float)
