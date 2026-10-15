from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Reminder(models.Model):
    """
    A scheduled message: a payment that falls due, an RSVP to chase, a
    vendor to follow up with, a document about to expire.

    The row is deliberately generic: ``target`` points at any wedding-scoped
    record via a content type, and ``kind`` explains what it is about. Rows
    are claimed by ``delivery.send_due_reminders`` through an atomic status
    transition, so concurrent Celery workers cannot double-send.
    """

    KIND_CHOICES = [
        ('guest_rsvp', 'Guest RSVP reminder'),
        ('payment_due', 'Payment due'),
        ('vendor_follow_up', 'Vendor follow-up'),
        ('document_expiry', 'Document expiry'),
        ('task_due', 'Task due'),
        ('test', 'Test message'),
        ('custom', 'Custom'),
    ]

    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('in_app', 'In-app'),
    ]

    # 'sending' is a transient claim state between 'pending' and a terminal
    # status; it lets delivery mark a row atomically before the slow part.
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sending', 'Sending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    wedding = models.ForeignKey(
        'weddings.Wedding',
        on_delete=models.CASCADE,
        related_name='reminders'
    )
    kind = models.CharField(max_length=30, choices=KIND_CHOICES, default='custom')
    channel = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default='email')

    # What this reminder is about (a Guest, Expense, Vendor, ...). Both fields
    # are nullable so generic reminders without a target still work, and
    # target_type is SET_NULL so deleting the record keeps the audit row.
    target_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reminders'
    )
    target_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey('target_type', 'target_id')

    # Recipient and content are snapshotted at creation time: the email that
    # was valid when the reminder was scheduled is the one that gets sent.
    to_email = models.EmailField(blank=True)
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField(blank=True)

    scheduled_for = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    error = models.TextField(blank=True)
    claimed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_kind_display()} reminder ({self.status}) for {self.wedding_id}"

    class Meta:
        db_table = 'notifications_reminder'
        ordering = ['-scheduled_for']
        indexes = [
            # Delivery scans pending rows by due time within a wedding.
            models.Index(fields=['wedding', 'status', 'scheduled_for']),
        ]
