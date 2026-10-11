"""Backfill WeddingCardGuest.source and rsvp_date.

Rows created before the source field existed default to 'external', which is
wrong for entries linked to a guest in the main list. The rsvp_date was
previously overwritten on every save (auto_now), so it now reflects the last
edit rather than the RSVP answer.
"""

from django.db import migrations


def backfill(apps, schema_editor):
    from django.utils import timezone

    WeddingCardGuest = apps.get_model('wedding_cards', 'WeddingCardGuest')

    # Linked guests are by definition from the main list.
    WeddingCardGuest.objects.filter(guest__isnull=False).exclude(
        source='main_list'
    ).update(source='main_list')
    WeddingCardGuest.objects.filter(guest__isnull=True).exclude(
        source='external'
    ).update(source='external')

    # Rows that had answered keep their existing (last-edit) timestamp; rows
    # that had not answered get no RSVP date, matching the new semantics.
    already_answered = WeddingCardGuest.objects.filter(
        rsvp_date__isnull=False
    ).count()
    if already_answered:
        # Preserve history rather than guessing when the answer was given.
        return

    answered_now = WeddingCardGuest.objects.exclude(rsvp_status='pending')
    answered_now.update(rsvp_date=timezone.now())


def noop(apps, schema_editor):
    """Backfill is not reversible: source and rsvp_date are now derived."""


class Migration(migrations.Migration):

    dependencies = [
        ('wedding_cards', '0002_alter_weddingcardguest_options_and_more'),
    ]

    operations = [
        migrations.RunPython(backfill, noop),
    ]
