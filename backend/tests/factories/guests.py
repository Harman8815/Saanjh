"""
Factory Boy factories for the guests module.

Field sets must match the models: RsvpStatus has only a unique name, Table
uses table_number/capacity, and Meal only a unique name.
"""

import factory
from factory import fuzzy
from factory.django import DjangoModelFactory

from guests.models import Guest, RsvpStatus, Table, Meal


class RsvpStatusFactory(DjangoModelFactory):
    """Factory for creating RsvpStatus instances (unique name only)."""

    class Meta:
        model = RsvpStatus
        django_get_or_create = ('name',)

    name = fuzzy.FuzzyChoice(['pending', 'confirmed', 'declined'])


class MealFactory(DjangoModelFactory):
    """Factory for creating Meal instances (unique name only)."""

    class Meta:
        model = Meal
        django_get_or_create = ('name',)

    name = factory.Sequence(lambda n: f'Meal {n}')


class TableFactory(DjangoModelFactory):
    """Factory for creating Table instances."""

    class Meta:
        model = Table

    wedding = factory.SubFactory('tests.factories.weddings.WeddingFactory')
    table_number = factory.Sequence(lambda n: n + 1)
    capacity = fuzzy.FuzzyInteger(4, 12)

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Ensure wedding is set when creating a table."""
        if not kwargs.get('wedding'):
            from .weddings import WeddingFactory
            kwargs['wedding'] = WeddingFactory()
        return super()._create(model_class, *args, **kwargs)


class GuestFactory(DjangoModelFactory):
    """Factory for creating Guest instances."""

    class Meta:
        model = Guest

    wedding = factory.SubFactory('tests.factories.weddings.WeddingFactory')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    email = factory.Sequence(lambda n: f'guest{n}@example.com')
    phone = factory.Faker('phone_number')
    relationship = fuzzy.FuzzyChoice(['family', 'friend', 'colleague', 'other'])
    address = factory.Faker('address')
    dietary_restrictions = factory.Faker('sentence', nb_words=4)
    notes = factory.Faker('sentence', nb_words=8)
    invitation_sent = fuzzy.FuzzyChoice([True, False])
    reminder_sent = fuzzy.FuzzyChoice([True, False])

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Ensure wedding and rsvp_status are set before creating."""
        if not kwargs.get('wedding'):
            from .weddings import WeddingFactory
            kwargs['wedding'] = WeddingFactory()
        if not kwargs.get('rsvp_status'):
            kwargs['rsvp_status'] = RsvpStatusFactory(name='pending')
        return super()._create(model_class, *args, **kwargs)

    @factory.post_generation
    def meals(self, create, extracted, **kwargs):
        """Attach meals through the GuestMeal junction table."""
        if not create or not extracted:
            return
        from guests.models import GuestMeal
        for meal in extracted:
            GuestMeal.objects.get_or_create(guest=self, meal=meal)
