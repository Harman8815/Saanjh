from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_populate_roles_and_settings'),
    ]

    operations = [
        migrations.AddField(
            model_name='settings',
            name='notifications',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='settings',
            name='privacy',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='settings',
            name='preferences',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
