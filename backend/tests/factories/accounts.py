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
    
    email = factory.Faker('email')
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
    """Factory for creating Role instances."""
    
    class Meta:
        model = Role
    
    name = factory.Faker('word')
    description = factory.Faker('text', max_nb_chars=200)
    permissions = factory.LazyFunction(lambda: {})


class SettingsFactory(DjangoModelFactory):
    """Factory for creating Settings instances."""
    
    class Meta:
        model = Settings
    
    user = factory.SubFactory(UserFactory)
    theme = fuzzy.FuzzyChoice(['light', 'dark', 'auto'])
    language = fuzzy.FuzzyChoice(['en', 'es', 'fr', 'de'])
    timezone = factory.Faker('timezone')
    email_notifications = True
    push_notifications = True
    sms_notifications = False
    currency = fuzzy.FuzzyChoice(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    date_format = fuzzy.FuzzyChoice(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'])
    time_format = fuzzy.FuzzyChoice(['12h', '24h'])
