"""
Celery tasks for the notifications app.

``send_due_reminders`` is intentionally a thin wrapper around
``notifications.delivery.send_due_reminders`` — the same function the
management command calls — so a reminder behaves identically whether it was
sent by beat, by a worker, or by hand.
"""

from celery import shared_task

from .delivery import send_due_reminders as _send_due_reminders


@shared_task(
    bind=True,
    # A reminder must not be dropped if a worker dies mid-run: the message is
    # redelivered rather than acknowledged before completion.
    acks_late=True,
    reject_on_worker_lost=True,
    max_retries=3,
)
def send_due_reminders(self):
    """Deliver every reminder whose scheduled_for has passed."""
    return _send_due_reminders()
