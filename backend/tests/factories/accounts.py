"""
Factory Boy factories for the accounts module.
"""

import factory
from factory import fuzzy
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model

from accounts.models import Role, Settings

User = get_user_model()


class UserFactory(DjangoModelFactory):
    """Factory for creating User instances."""

    class Meta:
        model = User
        django_get_or_create = ('username',)

    # Sequence guarantees uniqueness, since username is UNIQUE.
    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda o: f'{o.username}@example.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    is_active = True
    is_staff = False
    is_superuser = False
    
    @factory.post_generation
    def wedding(self, create, extracted, **kwargs):
        """Create a wedding for the user if requested."""
        if extracted or kwargs:
            from .weddings import WeddingFactory
            wedding = WeddingFactory(user=self, **kwargs)
            return wedding
        return None


class RoleFactory(DjangoModelFactory):
    """Factory for creating Role instances.

    Role only has a unique, choice-constrained name; there are no description
    or permissions columns.
    """

    class Meta:
        model = Role
        django_get_or_create = ('name',)

    name = fuzzy.FuzzyChoice(['bride', 'groom', 'guardian', 'admin'])


class SettingsFactory(DjangoModelFactory):
    """Factory for creating Settings instances."""

    class Meta:
        model = Settings

    user = factory.SubFactory(UserFactory)
    theme = fuzzy.FuzzyChoice(['light', 'dark', 'auto'])
    language = fuzzy.FuzzyChoice(['en', 'es', 'fr', 'de'])
    currency = fuzzy.FuzzyChoice(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    timezone = factory.Faker('timezone')
    # Notification, privacy and display preferences are JSON columns.
    notifications = factory.LazyFunction(lambda: {
        'email': True, 'push': False, 'sms': False,
        'reminders': True, 'rsvp_updates': True, 'vendor_updates': True,
        'expense_updates': False, 'task_reminders': True,
    })
    privacy = factory.LazyFunction(lambda: {
        'public_profile': False, 'show_guest_list': True,
        'share_contact': False, 'allow_photos': True,
        'search_visible': True,
    })
    preferences = factory.LazyFunction(lambda: {
        'date_format': 'MM/DD/YYYY', 'time_format': '12h',
        'start_of_week': 'monday', 'default_view': 'dashboard',
    })
