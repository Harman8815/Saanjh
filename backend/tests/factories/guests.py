"""
Factory Boy factories for the guests module.
"""

import factory
from factory import fuzzy
from factory.django import DjangoModelFactory

from guests.models import Guest, RsvpStatus, Table, Meal


class RsvpStatusFactory(DjangoModelFactory):
    """Factory for creating RsvpStatus instances."""
    
    class Meta:
        model = RsvpStatus
    
    name = factory.Faker('word')
    description = factory.Faker('text', max_nb_chars=200)
    color = factory.Faker('hex_color')
    is_confirmed = fuzzy.FuzzyChoice([True, False])


class MealFactory(DjangoModelFactory):
    """Factory for creating Meal instances."""
    
    class Meta:
        model = Meal
    
    name = factory.Faker('word')
    description = factory.Faker('text', max_nb_chars=300)
    ingredients = factory.LazyFunction(lambda: [factory.Faker('word').generate() for _ in range(3)])
    is_vegetarian = fuzzy.FuzzyChoice([True, False])
    is_vegan = fuzzy.FuzzyChoice([True, False])
    is_gluten_free = fuzzy.FuzzyChoice([True, False])
    price = factory.Faker('pydecimal', left_digits=2, right_digits=2, positive=True)


class TableFactory(DjangoModelFactory):
    """Factory for creating Table instances."""
    
    class Meta:
        model = Table
    
    name = factory.Faker('word')
    capacity = fuzzy.FuzzyInteger(4, 12)
    location = factory.Faker('word')
    shape = fuzzy.FuzzyChoice(['round', 'square', 'rectangular'])
    notes = factory.Faker('text', max_nb_chars=500)
    
    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Ensure wedding is set when creating table."""
        if 'wedding' not in kwargs:
            from .weddings import WeddingFactory
            wedding = WeddingFactory()
            kwargs['wedding'] = wedding
        return super()._create(model_class, *args, **kwargs)


class GuestFactory(DjangoModelFactory):
    """Factory for creating Guest instances."""
    
    class Meta:
        model = Guest
    
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    email = factory.Faker('email')
    phone = factory.Faker('phone_number')
    address = factory.Faker('address')
    relationship = fuzzy.FuzzyChoice(['family', 'friend', 'colleague', 'other'])
    plus_one = fuzzy.FuzzyChoice([True, False])
    plus_one_name = factory.LazyAttribute(lambda obj: factory.Faker('name').generate() if obj.plus_one else None)
    dietary_restrictions = factory.LazyFunction(lambda: [factory.Faker('word').generate() for _ in range(fuzzy.FuzzyInteger(0, 2).fuzz())])
    notes = factory.Faker('text', max_nb_chars=500)
    invitation_sent = fuzzy.FuzzyChoice([True, False])
    reminder_sent = fuzzy.FuzzyChoice([True, False])
    
    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Ensure wedding is set when creating guest."""
        if 'wedding' not in kwargs:
            from .weddings import WeddingFactory
            wedding = WeddingFactory()
            kwargs['wedding'] = wedding
        return super()._create(model_class, *args, **kwargs)
    
    @factory.post_generation
    def rsvp_status(self, create, extracted, **kwargs):
        """Set RSVP status if provided, otherwise create one."""
        if extracted:
            self.rsvp_status = extracted
            self.save()
        elif create and not self.rsvp_status:
            status = RsvpStatusFactory(**kwargs)
            self.rsvp_status = status
            self.save()
    
    @factory.post_generation
    def table(self, create, extracted, **kwargs):
        """Set table if provided."""
        if extracted:
            self.table = extracted
            self.save()
    
    @factory.post_generation
    def meals(self, create, extracted, **kwargs):
        """Set meals if provided."""
        if extracted:
            for meal in extracted:
                self.meals.add(meal)
