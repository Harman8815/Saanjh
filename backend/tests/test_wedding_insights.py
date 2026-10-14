"""
Unit tests for utils.wedding_insights: metrics, readiness, alerts, activity.

These are pure functions over a Wedding, so the tests build small, explicit
data sets and assert the exact numbers (no factories) — the point is the
contract: metric names, alert rules, and the readiness weighting.
"""

from datetime import date, timedelta

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

from expenses.models import BudgetCategory, Expense, ExpenseStatus
from guests.models import Guest, RsvpStatus
from tasks.models import Task, TaskPriority, TaskStatus
from utils.wedding_insights import (
    get_alerts,
    get_metrics,
    get_readiness,
    get_recent_activity,
)
from vendors.models import Vendor, VendorCatalog, VendorCategory, VendorStatus
from weddings.models import Wedding, WeddingStatus, Venue, VenueCatalog

User = get_user_model()


class InsightsTestCase(TestCase):
    """Shared fixture helpers for insight tests."""

    def setUp(self):
        self.user = User.objects.create_user(username='couple', email='couple@example.com')
        self.wedding = Wedding.objects.create(
            user=self.user,
            wedding_date=date.today() + timedelta(days=120),
            theme='Classic',
            status=WeddingStatus.objects.get_or_create(name='planning')[0],
        )

        # Reference rows every test may reuse.
        self.rsvp_pending = RsvpStatus.objects.get_or_create(name='pending')[0]
        self.rsvp_confirmed = RsvpStatus.objects.get_or_create(name='confirmed')[0]
        self.rsvp_declined = RsvpStatus.objects.get_or_create(name='declined')[0]
        self.expense_pending = ExpenseStatus.objects.get_or_create(name='pending')[0]
        self.expense_paid = ExpenseStatus.objects.get_or_create(name='paid')[0]
        self.expense_partial = ExpenseStatus.objects.get_or_create(name='partial')[0]
        self.vendor_pending = VendorStatus.objects.get_or_create(name='pending')[0]
        self.vendor_contacted = VendorStatus.objects.get_or_create(name='contacted')[0]
        self.vendor_confirmed = VendorStatus.objects.get_or_create(name='confirmed')[0]
        self.task_todo = TaskStatus.objects.get_or_create(name='todo')[0]
        self.task_completed = TaskStatus.objects.get_or_create(name='Completed')[0]
        # Task.priority defaults to id 2, which only exists once a priority
        # row has been created (seed migrations do not run under --nomigrations).
        self.task_medium = TaskPriority.objects.get_or_create(name='Medium')[0]

    # -- object helpers ----------------------------------------------------

    def make_budget_category(self, name, allocated):
        return BudgetCategory.objects.create(
            wedding=self.wedding, name=name, allocated_amount=allocated
        )

    def make_expense(self, title, amount, paid=0, status=None, due_date=None, category=None):
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

    def make_guest(self, first_name='Pat', last_name='Guest', status=None,
                   invitation_sent=False, invitation_sent_date=None):
        return Guest.objects.create(
            wedding=self.wedding,
            first_name=first_name,
            last_name=last_name,
            email=f'{first_name}.{last_name}@example.com'.lower(),
            rsvp_status=status or self.rsvp_pending,
            invitation_sent=invitation_sent,
            invitation_sent_date=invitation_sent_date,
        )

    def make_task(self, title, status=None, due_date=None):
        return Task.objects.create(
            wedding=self.wedding,
            title=title,
            status=status or self.task_todo,
            due_date=due_date,
            priority=self.task_medium,
        )

    def make_vendor(self, name='Studio One', status=None, cost_estimate=None,
                    actual_cost=None):
        category = VendorCategory.objects.get_or_create(name='Photography')[0]
        catalog = VendorCatalog.objects.create(
            name=name, category=category, contact='contact@example.com',
            price_range='1000.00', rating=4.5,
        )
        return Vendor.objects.create(
            wedding=self.wedding,
            vendor_catalog=catalog,
            status=status or self.vendor_pending,
            cost_estimate=cost_estimate,
            actual_cost=actual_cost,
        )


class TestGetMetrics(InsightsTestCase):
    """Metric names and formulas are the cross-module contract."""

    def test_empty_wedding_metrics_are_zero(self):
        metrics = get_metrics(self.wedding)
        self.assertEqual(metrics['total_budget'], 0)
        self.assertEqual(metrics['committed'], 0)
        self.assertEqual(metrics['paid'], 0)
        self.assertEqual(metrics['outstanding'], 0)
        self.assertEqual(metrics['budget_used_pct'], 0)
        self.assertEqual(metrics['projected_final_cost'], 0)
        self.assertEqual(metrics['guest_stats']['total'], 0)
        self.assertEqual(metrics['tasks_completion_pct'], 0)

    def test_budget_metrics(self):
        self.make_budget_category('Venue', 10000)
        self.make_expense('Venue deposit', 3000, paid=1000)
        self.make_expense('Cake', 500, paid=500)

        metrics = get_metrics(self.wedding)
        self.assertEqual(metrics['total_budget'], 10000)
        self.assertEqual(metrics['committed'], 3500)
        self.assertEqual(metrics['paid'], 1500)
        self.assertEqual(metrics['outstanding'], 2000)
        self.assertEqual(metrics['budget_used_pct'], 35.0)

    def test_projected_final_cost_uses_vendor_estimates_without_actuals(self):
        self.make_budget_category('Catering', 5000)
        self.make_expense('Catering deposit', 1000, paid=500)
        self.make_vendor('Caterer A', cost_estimate=4000, actual_cost=None)
        self.make_vendor('Caterer B', cost_estimate=9000, actual_cost=8000)

        metrics = get_metrics(self.wedding)
        # committed 1000 + remaining estimate 4000 (B is not projected).
        self.assertEqual(metrics['projected_final_cost'], 5000)

    def test_guest_and_task_counts(self):
        self.make_guest('A', 'One', status=self.rsvp_confirmed)
        self.make_guest('B', 'Two', status=self.rsvp_pending)
        self.make_task('Buy invites', status=self.task_completed)
        self.make_task('Book band', status=self.task_todo)

        metrics = get_metrics(self.wedding)
        self.assertEqual(metrics['guest_stats']['total'], 2)
        self.assertEqual(metrics['guest_stats']['confirmed'], 1)
        self.assertEqual(metrics['tasks']['total'], 2)
        self.assertEqual(metrics['tasks_completion_pct'], 50.0)

    def test_overdue_expense_count_excludes_paid(self):
        today = date.today()
        self.make_expense('Late', 100, due_date=today - timedelta(days=1))
        self.make_expense('Paid late', 100, paid=100,
                          status=self.expense_paid, due_date=today - timedelta(days=1))

        metrics = get_metrics(self.wedding)
        self.assertEqual(metrics['overdue_expenses_count'], 1)


class TestGetReadiness(InsightsTestCase):
    """Readiness is the weighted mean of the five domain percentages."""

    def test_empty_wedding_is_zero_ready(self):
        readiness = get_readiness(self.wedding)
        self.assertEqual(readiness['score'], 0.0)
        self.assertEqual(len(readiness['domains']), 5)

    def test_weights_are_applied(self):
        # Budget only: 15% weight -> score 15.0.
        self.make_budget_category('Venue', 1000)
        readiness = get_readiness(self.wedding)
        budget_domain = next(d for d in readiness['domains'] if d['key'] == 'budget')
        self.assertEqual(budget_domain['pct'], 100.0)
        self.assertEqual(budget_domain['weight'], 0.15)
        self.assertEqual(readiness['score'], 15.0)

    def test_all_domains_complete_gives_100(self):
        catalog = VenueCatalog.objects.create(
            name='Hall', type='ballroom', address='1 Street',
            capacity_min=10, capacity_max=100, price='1000.00',
        )
        venue = Venue.objects.create(venue_catalog=catalog)
        self.wedding.venue = venue
        self.wedding.venue_catalog = catalog
        self.wedding.save()

        self.make_budget_category('Venue', 1000)
        self.make_guest('A', 'One', status=self.rsvp_confirmed)
        self.make_vendor('Band', status=self.vendor_confirmed)
        self.make_task('Invites', status=self.task_completed)

        readiness = get_readiness(self.wedding)
        self.assertEqual(readiness['score'], 100.0)


class TestGetAlerts(InsightsTestCase):
    """Alert rules, severities, and payload shape."""

    def _ids(self, alerts):
        return [alert['id'] for alert in alerts]

    def test_no_alerts_for_clean_wedding(self):
        self.assertEqual(get_alerts(self.wedding), [])

    def test_overdue_expense_alert_is_critical(self):
        self.make_expense('Balance due', 200, due_date=date.today() - timedelta(days=3))
        alerts = get_alerts(self.wedding)

        alert = next(a for a in alerts if a['id'] == 'overdue-expense-1')
        self.assertEqual(alert['severity'], 'critical')
        self.assertEqual(alert['entity_type'], 'expense')
        self.assertEqual(alert['entity_id'], 1)
        self.assertTrue(alert['message'])
        self.assertEqual(
            alert.keys(),
            {'id', 'severity', 'title', 'message', 'action_label',
             'action_url', 'entity_type', 'entity_id'},
        )

    def test_paid_overdue_expense_is_not_alerted(self):
        self.make_expense('Paid', 200, paid=200, status=self.expense_paid,
                          due_date=date.today() - timedelta(days=3))
        self.assertEqual(get_alerts(self.wedding), [])

    def test_expense_due_within_14_days_warns(self):
        self.make_expense('Final payment', 500, due_date=date.today() + timedelta(days=10))
        self.assertIn('expenses-due-soon', self._ids(get_alerts(self.wedding)))

    def test_stale_pending_rsvp_warns(self):
        self.make_guest(
            'Silent', 'Type', status=self.rsvp_pending,
            invitation_sent=True,
            invitation_sent_date=timezone.now() - timedelta(days=10),
        )
        self.assertIn('stale-rsvps', self._ids(get_alerts(self.wedding)))

    def test_fresh_pending_rsvp_is_not_alerted(self):
        self.make_guest('Recent', 'Invite', status=self.rsvp_pending,
                        invitation_sent=True,
                        invitation_sent_date=timezone.now() - timedelta(days=2))
        self.assertNotIn('stale-rsvps', self._ids(get_alerts(self.wedding)))

    def test_overdue_task_alert(self):
        self.make_task('Send invites', due_date=timezone.now() - timedelta(days=2))
        self.assertIn('overdue-task-1', self._ids(get_alerts(self.wedding)))

    def test_completed_task_is_not_overdue(self):
        self.make_task('Done', status=self.task_completed,
                       due_date=timezone.now() - timedelta(days=2))
        self.assertEqual(get_alerts(self.wedding), [])

    def test_budget_category_over_threshold_warns_and_over_allocated_criticals(self):
        category = self.make_budget_category('Catering', 1000)
        self.make_expense('Deposit', 950, category=category)
        self.assertIn('budget-category-1', self._ids(get_alerts(self.wedding)))

        self.make_expense('Second deposit', 100, category=category)
        alert = next(a for a in get_alerts(self.wedding)
                     if a['id'] == 'budget-category-1')
        self.assertEqual(alert['severity'], 'critical')

    def test_venue_over_capacity_alerts(self):
        catalog = VenueCatalog.objects.create(
            name='Small Hall', type='ballroom', address='1 Street',
            capacity_min=10, capacity_max=50, price='1000.00',
        )
        self.wedding.venue_catalog = catalog
        self.wedding.save()
        for i in range(5):
            self.make_guest(f'G{i}', 'Confirm', status=self.rsvp_confirmed)
        self.make_vendor('Fake Band')  # not venue-related, just extra data

        # 51 confirmed guests exceeds capacity_max of 50.
        for i in range(5, 51):
            self.make_guest(f'G{i}', 'Confirm', status=self.rsvp_confirmed)
        self.assertIn('venue-over-capacity', self._ids(get_alerts(self.wedding)))

    def test_alerts_sorted_most_severe_first(self):
        self.make_expense('Overdue', 100, due_date=date.today() - timedelta(days=5))
        self.make_expense('Due soon', 100, due_date=date.today() + timedelta(days=5))
        alerts = get_alerts(self.wedding)
        severities = [alert['severity'] for alert in alerts]
        self.assertEqual(severities, sorted(severities, key=lambda s: {
            'critical': 0, 'warning': 1, 'info': 2,
        }[s]))


class TestGetRecentActivity(InsightsTestCase):
    def test_feed_shape(self):
        self.make_guest('Ada', 'Guest')
        self.make_expense('Flowers', 300)
        activity = get_recent_activity(self.wedding)

        self.assertEqual(set(activity), {'guests', 'expenses', 'vendors'})
        self.assertEqual(activity['guests'][0]['name'], 'Ada Guest')
        self.assertIsNotNone(activity['guests'][0]['date'])
        self.assertEqual(activity['expenses'][0]['description'], 'Flowers')

    def test_vendor_dates_are_none_before_timestamp_migration(self):
        # Vendor.updated_at arrives in Stage 1; until then the feed must not
        # raise, and vendor dates stay null.
        self.make_vendor('Studio')
        activity = get_recent_activity(self.wedding)
        self.assertEqual(activity['vendors'][0]['name'], 'Studio')
        self.assertIsNone(activity['vendors'][0]['date'])
