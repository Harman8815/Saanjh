"""
Reminder delivery.

This is the single implementation both the Celery beat task and the
``send_due_reminders`` management command call, so behaviour is identical
whether a reminder is sent by a worker or by hand.

Claiming is an atomic ``UPDATE ... WHERE status='pending'``: on SQLite row
locks are not available, so the status transition itself is the concurrency
control — a second worker can only ever claim a row the first one already
moved out of 'pending'.
"""

import logging
from datetime import timedelta

from django.utils import timezone

from .models import Reminder

logger = logging.getLogger(__name__)

# A row claimed but not finished within this window is assumed abandoned by a
# crashed worker and is returned to 'pending' so it is retried.
STALE_CLAIM_MINUTES = 10

# Hard cap on rows processed per run, so one backlog cannot monopolise a
# worker for an unbounded time. The next run picks up the remainder.
MAX_ROWS_PER_RUN = 200


def _reset_stale_claims(now):
    """Return rows stuck in the transient 'sending' state to 'pending'."""
    cutoff = now - timedelta(minutes=STALE_CLAIM_MINUTES)
    recovered = Reminder.objects.filter(
        status='sending',
        claimed_at__lt=cutoff,
    ).update(status='pending', claimed_at=None)
    if recovered:
        logger.info('Recovered %d stale reminder claim(s).', recovered)
    return recovered


def _due_reminder_ids(now):
    return list(
        Reminder.objects.filter(
            status='pending',
            scheduled_for__lte=now,
        ).order_by('scheduled_for').values_list('id', flat=True)[:MAX_ROWS_PER_RUN]
    )


def _claim(ids, now):
    """Atomically move pending rows to 'sending'. Returns the number claimed."""
    if not ids:
        # Avoid a pointless UPDATE ... WHERE id IN () round trip.
        return 0
    return Reminder.objects.filter(
        pk__in=ids,
        status='pending',
    ).update(status='sending', claimed_at=now)


def _send_email(reminder):
    from django.core import mail

    if not reminder.to_email:
        raise ValueError('Email reminder has no recipient address.')

    message = mail.EmailMessage(
        subject=reminder.subject or 'Wedding reminder',
        body=reminder.message or '',
        to=[reminder.to_email],
    )
    # fail_silently=False: a delivery failure must be recorded per row, not
    # swallowed by the mail backend.
    message.send(fail_silently=False)


def _mark_sent(reminder, now):
    Reminder.objects.filter(pk=reminder.pk).update(
        status='sent',
        sent_at=now,
        error='',
        claimed_at=None,
    )
    # Mirror onto the in-memory row: post-send effects (e.g. stamping the
    # guest's reminder_sent_date) read these values.
    reminder.status = 'sent'
    reminder.sent_at = now
    reminder.error = ''


def _apply_post_send_effects(reminder):
    """
    Stamp the record a reminder was about once delivery succeeded.

    Kept deliberately small (one mapping today): an RSVP reminder that went
    out marks the guest as reminded, so the guest list can show it.
    """
    if reminder.kind != 'guest_rsvp' or not reminder.target:
        return

    from guests.models import Guest

    Guest.objects.filter(pk=reminder.target_id).update(
        reminder_sent=True,
        reminder_sent_date=reminder.sent_at,
    )


def _mark_failed(reminder, now, error):
    Reminder.objects.filter(pk=reminder.pk).update(
        status='failed',
        error=error,
        claimed_at=None,
    )


def send_reminder(reminder, now=None):
    """Deliver one claimed reminder. Returns True on success."""
    now = now or timezone.now()
    try:
        if reminder.channel == 'email':
            _send_email(reminder)
        # In-app reminders are delivered by the row itself; nothing to send.
        _mark_sent(reminder, now)
        _apply_post_send_effects(reminder)
        return True
    except Exception as exc:
        # Never raise on a single-row failure: one bad row must not abort the
        # rest of the batch, and the error is stored for the UI.
        logger.exception('Failed to send reminder %s', reminder.pk)
        _mark_failed(reminder, now, f'{type(exc).__name__}: {exc}')
        return False


def send_due_reminders(dry_run=False, now=None):
    """
    Send every reminder whose scheduled_for has passed.

    Returns a summary dict: {'sent', 'failed', 'considered', 'claimed'}.
    In dry-run mode the due rows are reported but nothing is sent or mutated.
    """
    now = now or timezone.now()

    if dry_run:
        due = Reminder.objects.filter(status='pending', scheduled_for__lte=now)
        return {
            'dry_run': True,
            'considered': due.count(),
            'sent': 0,
            'failed': 0,
        }

    _reset_stale_claims(now)
    due_ids = _due_reminder_ids(now)
    claimed = _claim(due_ids, now)

    sent = failed = 0
    for reminder in Reminder.objects.filter(pk__in=due_ids, status='sending'):
        if send_reminder(reminder, now):
            sent += 1
        else:
            failed += 1

    return {
        'dry_run': False,
        # 'considered' counts what was due; 'claimed' guards against a race
        # where another worker claimed some rows first.
        'considered': len(due_ids),
        'claimed': claimed,
        'sent': sent,
        'failed': failed,
    }
