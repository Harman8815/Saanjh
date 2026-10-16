"""
Single source of truth for wedding planning insights: metrics, alerts,
readiness, and the recent-activity feed.

Everything here is a pure function of a ``Wedding`` instance — no HTTP, no
serializers — so the dashboard, the individual module pages, and the
notification digest all read identical numbers. Metric names are part of the
API contract and must stay stable:

* ``total_budget``        - sum of BudgetCategory.allocated_amount
* ``committed``           - sum of Expense.amount for non-cancelled expenses
* ``paid``                - sum of Expense.paid_amount
* ``outstanding``         - committed - paid
* ``budget_used_pct``     - committed / total_budget
* ``projected_final_cost``- committed + sum of Vendor.cost_estimate where the
                            vendor has no actual_cost yet

Statuses are matched by name, case-insensitively, never by id: the seeded ids
are environment-dependent and the display names differ in case
('Completed' vs 'completed').
"""

from datetime import timedelta
from decimal import Decimal

from django.db.models import F, Q, Sum
from django.utils import timezone


# Alert severities, ordered by urgency. The frontend maps them to colours.
SEVERITY_CRITICAL = 'critical'
SEVERITY_WARNING = 'warning'
SEVERITY_INFO = 'info'

# Maximum number of entity-level alerts of one kind before they roll up into
# a single summary alert (the dashboard must stay readable).
_ALERT_LIST_LIMIT = 5

# Thresholds used by the alert rules.
_BUDGET_ALERT_THRESHOLD_PCT = 90        # budget category at/over this pct
_VENUE_CAPACITY_HEADROOM = 0            # confirmed guests above capacity_max
_DUE_SOON_DAYS = 14                     # unpaid expenses due within N days
_RSVP_STALE_DAYS = 7                    # invitations with no RSVP after N days
_VENDOR_STUCK_DAYS = 14                 # 'contacted' vendors not updated in N days


def _non_cancelled():
    """Q object excluding expenses whose status is 'cancelled'/'canceled'."""
    return Q(status__name__iexact='cancelled') | Q(status__name__iexact='canceled')


def _decimal(value):
    return float(value) if isinstance(value, Decimal) else (value or 0)


def _pct(part, whole):
    """Percentage helper that treats a zero denominator as 0, never an error."""
    return round((part / whole) * 100, 1) if whole else 0.0


def _iso(value):
    return value.isoformat() if value else None


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

def get_metrics(wedding):
    """
    Budget/task/RSVP/vendor metrics for the wedding.

    All money totals are computed with a single aggregate per relation so the
    dashboard does not iterate expense rows in Python.
    """
    expense_totals = wedding.expenses.exclude(_non_cancelled()).aggregate(
        committed=Sum('amount'),
        paid=Sum('paid_amount'),
    )
    committed = _decimal(expense_totals['committed'])
    paid = _decimal(expense_totals['paid'])

    total_budget = _decimal(
        wedding.budget_categories.aggregate(total=Sum('allocated_amount'))['total']
    )

    # A vendor with no actual cost is still an expected cost, so its estimate
    # is projected forward.
    projected_vendor = _decimal(
        wedding.vendors.filter(actual_cost__isnull=True).aggregate(
            estimated=Sum('cost_estimate')
        )['estimated']
    )

    guest_counts = _guest_counts(wedding)
    vendor_counts = _vendor_counts(wedding)
    task_stats = _task_stats(wedding)
    completed_status = _completed_status_name().lower()

    return {
        'total_budget': total_budget,
        'committed': committed,
        'paid': paid,
        'outstanding': round(committed - paid, 2),
        'budget_used_pct': _pct(committed, total_budget),
        'projected_final_cost': round(committed + projected_vendor, 2),
        'guest_stats': guest_counts,
        'vendor_stats': vendor_counts,
        'tasks': task_stats,
        'tasks_completion_pct': _pct(
            task_stats.get(completed_status, 0), task_stats.get('total', 0)
        ),
        'expenses_count': wedding.expenses.exclude(_non_cancelled()).count(),
        'overdue_expenses_count': wedding.expenses.exclude(
            _non_cancelled()
        ).filter(
            due_date__isnull=False,
            due_date__lt=timezone.now().date(),
        ).exclude(status__name__iexact='paid').count(),
    }


def _completed_status_name():
    """Name of the task status that counts as complete ('Completed')."""
    from tasks.models import TaskStatus

    status = TaskStatus.objects.filter(name__iexact='completed').first()
    return status.name if status else 'completed'


def _guest_counts(wedding):
    """Guest totals keyed by RSVP status name, plus an 'invited' convenience count."""
    counts = {'total': wedding.guests.count()}
    for name in ('confirmed', 'pending', 'declined'):
        counts[name] = wedding.guests.filter(rsvp_status__name__iexact=name).count()
    counts['invitations_sent'] = wedding.guests.filter(invitation_sent=True).count()
    return counts


def _vendor_counts(wedding):
    counts = {'total': wedding.vendors.count()}
    for name in ('confirmed', 'pending', 'contacted'):
        counts[name] = wedding.vendors.filter(status__name__iexact=name).count()
    return counts


def _task_stats(wedding):
    """Task totals per status name (case-preserved as seeded) plus 'total'."""
    from tasks.models import TaskStatus

    stats = {'total': wedding.tasks.count()}
    for status in TaskStatus.objects.all():
        key = status.name.lower()
        stats[key] = wedding.tasks.filter(status=status).count()
    return stats


# ---------------------------------------------------------------------------
# Readiness
# ---------------------------------------------------------------------------

# Domain weights for the readiness score (must sum to 1.0).
_READINESS_WEIGHTS = {
    'venue': 0.15,
    'budget': 0.15,
    'guests': 0.20,
    'vendors': 0.20,
    'tasks': 0.30,
}


def get_readiness(wedding):
    """
    Weighted completion score across five planning domains.

    Each domain is a 0-100 percentage; the overall score is the weighted mean.
    A domain with no data scores 0 (a fresh wedding is 0% ready, not 100%).
    """
    guest_counts = _guest_counts(wedding)
    vendor_counts = _vendor_counts(wedding)
    task_stats = _task_stats(wedding)
    completed_key = _completed_status_name().lower()

    venue_chosen = 100.0 if (wedding.venue_catalog_id or wedding.venue_id) else 0.0
    budget_configured = 100.0 if _decimal(
        wedding.budget_categories.aggregate(total=Sum('allocated_amount'))['total']
    ) > 0 else 0.0
    rsvp_progress = _pct(guest_counts['confirmed'], guest_counts['total'])

    domains = [
        {
            'key': 'venue',
            'label': 'Venue chosen',
            'pct': venue_chosen,
            'weight': _READINESS_WEIGHTS['venue'],
        },
        {
            'key': 'budget',
            'label': 'Budget configured',
            'pct': budget_configured,
            'weight': _READINESS_WEIGHTS['budget'],
        },
        {
            'key': 'guests',
            'label': 'Guest RSVP progress',
            'pct': rsvp_progress,
            'weight': _READINESS_WEIGHTS['guests'],
            'detail': {
                'confirmed': guest_counts['confirmed'],
                'total': guest_counts['total'],
            },
        },
        {
            'key': 'vendors',
            'label': 'Vendor confirmation',
            'pct': _pct(vendor_counts['confirmed'], vendor_counts['total']),
            'weight': _READINESS_WEIGHTS['vendors'],
            'detail': {
                'confirmed': vendor_counts['confirmed'],
                'total': vendor_counts['total'],
            },
        },
        {
            'key': 'tasks',
            'label': 'Task completion',
            'pct': _pct(task_stats.get(completed_key, 0), task_stats['total']),
            'weight': _READINESS_WEIGHTS['tasks'],
            'detail': {
                'completed': task_stats.get(completed_key, 0),
                'total': task_stats['total'],
            },
        },
    ]

    score = round(sum(domain['pct'] * domain['weight'] for domain in domains), 1)
    return {'score': score, 'domains': domains}


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------

def get_alerts(wedding):
    """
    Actionable alerts for the wedding, most severe first.

    Every rule is computed here once; the dashboard, module pages, and the
    reminder digest share this list so nothing can drift apart.
    """
    alerts = []
    alerts.extend(_overdue_expense_alerts(wedding))
    alerts.extend(_due_soon_alerts(wedding))
    alerts.extend(_stale_rsvp_alerts(wedding))
    alerts.extend(_stuck_vendor_alerts(wedding))
    alerts.extend(_overdue_task_alerts(wedding))
    alerts.extend(_budget_category_alerts(wedding))
    alerts.extend(_venue_capacity_alerts(wedding))

    severity_rank = {SEVERITY_CRITICAL: 0, SEVERITY_WARNING: 1, SEVERITY_INFO: 2}
    alerts.sort(key=lambda alert: severity_rank.get(alert['severity'], 3))
    return alerts


def _alert(alert_id, severity, title, message, action_label=None,
           action_url=None, entity_type=None, entity_id=None):
    return {
        'id': alert_id,
        'severity': severity,
        'title': title,
        'message': message,
        'action_label': action_label,
        'action_url': action_url,
        'entity_type': entity_type,
        'entity_id': entity_id,
    }


def _overdue_expense_alerts(wedding):
    today = timezone.now().date()
    overdue = wedding.expenses.exclude(_non_cancelled()).filter(
        due_date__isnull=False,
        due_date__lt=today,
    ).exclude(status__name__iexact='paid').select_related('budget_category').order_by('due_date')

    if not overdue.exists():
        return []

    alerts = [
        _alert(
            f'overdue-expense-{expense.id}',
            SEVERITY_CRITICAL,
            'Payment overdue',
            f'"{expense.title}" was due on {expense.due_date:%b %d, %Y} '
            f'({expense.remaining_balance():.2f} unpaid).',
            action_label='Review expense',
            action_url=f'/dashboard/budget?tab=history&expense={expense.id}',
            entity_type='expense',
            entity_id=expense.id,
        )
        for expense in overdue[:_ALERT_LIST_LIMIT]
    ]
    if overdue.count() > _ALERT_LIST_LIMIT:
        alerts.append(_alert(
            'overdue-expenses-more',
            SEVERITY_CRITICAL,
            'More overdue payments',
            f'{overdue.count() - _ALERT_LIST_LIMIT} further expense(s) are past their due date.',
            action_label='View all overdue',
            action_url='/dashboard/budget?tab=history&status=overdue',
        ))
    return alerts


def _due_soon_alerts(wedding):
    today = timezone.now().date()
    horizon = today + timedelta(days=_DUE_SOON_DAYS)
    due_soon = wedding.expenses.exclude(_non_cancelled()).filter(
        due_date__isnull=False,
        due_date__gte=today,
        due_date__lte=horizon,
    ).exclude(status__name__iexact='paid')

    if not due_soon.exists():
        return []

    return [_alert(
        'expenses-due-soon',
        SEVERITY_WARNING,
        'Payments due soon',
        f'{due_soon.count()} unpaid expense(s) fall due within the next '
        f'{_DUE_SOON_DAYS} days.',
        action_label='View upcoming',
        action_url='/dashboard/budget?tab=projection',
    )]


def _stale_rsvp_alerts(wedding):
    cutoff = timezone.now() - timedelta(days=_RSVP_STALE_DAYS)
    stale = wedding.guests.filter(
        rsvp_status__name__iexact='pending',
        invitation_sent=True,
        invitation_sent_date__lt=cutoff,
    )
    if not stale.exists():
        return []

    return [_alert(
        'stale-rsvps',
        SEVERITY_WARNING,
        'RSVPs still pending',
        f'{stale.count()} guest(s) were invited over {_RSVP_STALE_DAYS} days ago '
        'and have not responded.',
        action_label='Send reminders',
        action_url='/dashboard/guests/list?rsvp_status=pending',
    )]


def _stuck_vendor_alerts(wedding):
    """
    Vendors sitting in 'contacted' for too long.

    ``updated_at`` is read defensively so this rule is a no-op until the
    Vendor timestamp migration has been applied.
    """
    cutoff = timezone.now() - timedelta(days=_VENDOR_STUCK_DAYS)
    stuck = [
        vendor for vendor in wedding.vendors.filter(status__name__iexact='contacted')
        .select_related('vendor_catalog')
        if getattr(vendor, 'updated_at', None) and vendor.updated_at < cutoff
    ]
    if not stuck:
        return []

    alerts = []
    for vendor in stuck[:_ALERT_LIST_LIMIT]:
        name = vendor.vendor_catalog.name if vendor.vendor_catalog else 'Vendor'
        alerts.append(_alert(
            f'stuck-vendor-{vendor.id}',
            SEVERITY_WARNING,
            'Vendor needs follow-up',
            f'"{name}" has been in contacted status since '
            f'{vendor.updated_at:%b %d, %Y} — follow up to confirm.',
            action_label='Open vendor',
            action_url=f'/dashboard/vendors/{vendor.id}',
            entity_type='vendor',
            entity_id=vendor.id,
        ))
    return alerts


def _overdue_task_alerts(wedding):
    completed = _completed_status_name()
    overdue = wedding.tasks.filter(
        due_date__isnull=False,
        due_date__lt=timezone.now(),
    ).exclude(status__name__iexact=completed)

    if not overdue.exists():
        return []

    alerts = []
    for task in overdue[:_ALERT_LIST_LIMIT]:
        alerts.append(_alert(
            f'overdue-task-{task.id}',
            SEVERITY_CRITICAL,
            'Task overdue',
            f'"{task.title}" was due on {task.due_date:%b %d, %Y}.',
            action_label='Open task board',
            action_url='/dashboard/tasks?is_overdue=true',
            entity_type='task',
            entity_id=task.id,
        ))
    if overdue.count() > _ALERT_LIST_LIMIT:
        alerts.append(_alert(
            'overdue-tasks-more',
            SEVERITY_CRITICAL,
            'More overdue tasks',
            f'{overdue.count() - _ALERT_LIST_LIMIT} further task(s) are past due.',
            action_label='View all',
            action_url='/dashboard/tasks?is_overdue=true',
        ))
    return alerts


def _budget_category_alerts(wedding):
    """
    Categories at or over the alert threshold, worst first.

    Uses a per-category aggregate instead of iterating expense rows in Python.
    """
    categories = wedding.budget_categories.annotate(
        committed=Sum(
            'expenses__amount',
            filter=~Q(expenses__status__name__iexact='cancelled')
            & ~Q(expenses__status__name__iexact='canceled'),
        )
    ).filter(allocated_amount__gt=0)

    alerts = []
    for category in categories:
        committed = _decimal(category.committed)
        allocated = _decimal(category.allocated_amount)
        pct = _pct(committed, allocated)
        if committed > allocated:
            severity = SEVERITY_CRITICAL
            title = 'Budget category overspent'
            message = (
                f'"{category.name}" is over budget: {committed:.2f} committed '
                f'against {allocated:.2f} allocated ({pct}%).'
            )
        elif pct >= _BUDGET_ALERT_THRESHOLD_PCT:
            severity = SEVERITY_WARNING
            title = 'Budget category nearly exhausted'
            message = (
                f'"{category.name}" has used {pct}% of its '
                f'{allocated:.2f} allocation.'
            )
        else:
            continue

        alerts.append(_alert(
            f'budget-category-{category.id}',
            severity,
            title,
            message,
            action_label='View category',
            action_url=f'/dashboard/budget?tab=history&category={category.id}',
            entity_type='budget_category',
            entity_id=category.id,
        ))
    return alerts


def _venue_capacity_alerts(wedding):
    """Confirmed guests above the venue's maximum capacity."""
    catalog = None
    if wedding.venue_catalog_id:
        catalog = wedding.venue_catalog
    elif wedding.venue_id and wedding.venue.venue_catalog_id:
        catalog = wedding.venue.venue_catalog
    if not catalog or not catalog.capacity_max:
        return []

    confirmed = wedding.guests.filter(rsvp_status__name__iexact='confirmed').count()
    if confirmed <= catalog.capacity_max:
        return []

    return [_alert(
        'venue-over-capacity',
        SEVERITY_CRITICAL,
        'Venue over capacity',
        f'{confirmed} confirmed guests exceed the capacity of '
        f'"{catalog.name}" ({catalog.capacity_max}).',
        action_label='Browse venues',
        action_url='/dashboard/venues',
        entity_type='venue',
        entity_id=catalog.id,
    )]


# ---------------------------------------------------------------------------
# Recent activity
# ---------------------------------------------------------------------------

def get_recent_activity(wedding, limit=5):
    """
    Reverse-chronological feed of recent guest/expense/vendor changes.

    Vendor dates come from the Vendor timestamps added in Stage 1; until those
    exist the feed falls back to a stable "recently added" ordering by id.
    """
    recent_guests = [
        {
            'name': guest.full_name or guest.email or 'Guest',
            'date': _iso(guest.added_date),
            'type': 'guest_added',
        }
        for guest in wedding.guests.order_by('-added_date')[:limit]
    ]
    recent_expenses = [
        {
            'description': expense.title,
            'date': _iso(expense.created_at),
            'type': 'expense_logged',
        }
        for expense in wedding.expenses.order_by('-created_at')[:limit]
    ]

    # Order by updated_at when the field exists, else by recency of creation
    # (id) so the feed stays meaningful during the transition.
    vendors = wedding.vendors.select_related('vendor_catalog')
    if any(field.name == 'updated_at' for field in vendors.model._meta.get_fields()):
        vendors = vendors.order_by('-updated_at')
    else:
        vendors = vendors.order_by('-id')
    recent_vendors = [
        {
            'name': vendor.vendor_catalog.name if vendor.vendor_catalog else 'Unknown',
            'date': _iso(getattr(vendor, 'updated_at', None)),
            'type': 'vendor_updated',
        }
        for vendor in vendors[:limit]
    ]

    return {
        'guests': recent_guests,
        'expenses': recent_expenses,
        'vendors': recent_vendors,
    }
