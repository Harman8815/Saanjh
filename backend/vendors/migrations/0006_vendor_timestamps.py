# Manual migration: Vendor timestamps with an explicit backfill.
#
# Added in three steps on purpose: nullable columns first, an explicit data
# migration that stamps pre-existing rows, then the final auto_now_add /
# auto_now definition. This keeps the migration reversible and makes the
# backfill of existing rows visible rather than hiding it in an AddField
# default.

import django.utils.timezone
from django.db import migrations, models


def backfill_vendor_timestamps(apps, schema_editor):
    """Stamp existing vendors with the migration time (both columns)."""
    Vendor = apps.get_model('vendors', 'Vendor')
    now = django.utils.timezone.now()
    Vendor.objects.all().update(created_at=now, updated_at=now)


def clear_vendor_timestamps(apps, schema_editor):
    """Reverse: null the columns back out (the fields are nullable at this point)."""
    Vendor = apps.get_model('vendors', 'Vendor')
    Vendor.objects.all().update(created_at=None, updated_at=None)


class Migration(migrations.Migration):

    dependencies = [
        ('vendors', '0005_alter_vendor_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='vendor',
            name='created_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='vendor',
            name='updated_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.RunPython(
            backfill_vendor_timestamps,
            clear_vendor_timestamps,
        ),
        migrations.AlterField(
            model_name='vendor',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='vendor',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddIndex(
            model_name='vendor',
            index=models.Index(fields=['wedding', '-updated_at'], name='vendors_ven_wedding_6d64d2_idx'),
        ),
    ]
