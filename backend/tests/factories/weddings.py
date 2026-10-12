"""
Factory Boy factories for the weddings module.

The Wedding model is deliberately slim: a user, an optional venue relation, a
required status, a date and a theme. Fields such as bride_name, budget and
guest_count do not exist on the model and are not generated here.
"""

import factory
from factory import fuzzy
from factory.django import DjangoModelFactory
from faker import Faker as FakerLibrary
from django.contrib.auth import get_user_model

from weddings.models import Wedding, WeddingStatus

User = get_user_model()


def _faker():
    """Return a configured Faker instance for use in LazyAttributes."""
    return FakerLibrary()


class WeddingFactory(DjangoModelFactory):
    """Factory for creating Wedding instances."""

    class Meta:
        model = Wedding

    user = factory.SubFactory('tests.factories.accounts.UserFactory')
    status = factory.SubFactory('tests.factories.weddings.WeddingStatusFactory')
    wedding_date = factory.Faker('date_between', start_date='+30d', end_date='+365d')
    theme = factory.Faker('word')

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Ensure a status exists before creating."""
        if not kwargs.get('status'):
            kwargs['status'] = _default_status()
        return super()._create(model_class, *args, **kwargs)


def _default_status():
    """Return the default 'planning' wedding status, creating it if needed."""
    status, _ = WeddingStatus.objects.get_or_create(name='planning')
    return status


class WeddingStatusFactory(DjangoModelFactory):
    """Factory for creating WeddingStatus instances (unique name only)."""

    class Meta:
        model = WeddingStatus
        django_get_or_create = ('name',)

    name = fuzzy.FuzzyChoice(['planning', 'confirmed', 'completed'])
