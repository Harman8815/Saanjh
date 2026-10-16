"""
Manually deliver due reminders without a Celery worker.

    python manage.py send_due_reminders
    python manage.py send_due_reminders --dry-run

The Celery beat task calls the same delivery function, so this command is
both a debugging tool and a fallback for deployments without a worker.
"""

from django.core.management.base import BaseCommand

from notifications.delivery import send_due_reminders


class Command(BaseCommand):
    help = 'Send reminders whose scheduled_for has passed (idempotent).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Report what would be sent without sending anything.',
        )

    def handle(self, *args, **options):
        summary = send_due_reminders(dry_run=options['dry_run'])

        if summary.get('dry_run'):
            self.stdout.write(
                self.style.WARNING(
                    f"Dry run: {summary['considered']} reminder(s) would be sent."
                )
            )
            return

        self.stdout.write(
            self.style.SUCCESS(
                f"Sent {summary['sent']} reminder(s), "
                f"{summary['failed']} failed, "
                f"{summary['considered']} considered."
            )
        )
