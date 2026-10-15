"""
Celery application for wedding_backend.

Loaded from ``wedding_backend/__init__.py`` so the worker, beat, and Django
processes all share one configuration. Redis is the broker (and the result
backend); override with ``DJANGO_CELERY_BROKER_URL`` in the environment.
"""

import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wedding_backend.settings')

app = Celery('wedding_backend')

# namespace='CELERY' reads CELERY_* settings (broker, backend, beat schedule,
# task options) from the Django settings file with no separate config module.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Discover tasks.py modules in every installed app (notifications.tasks, ...).
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Diagnostic task: print the request id from a worker shell."""
    print(f'Request: {self.request!r}')
