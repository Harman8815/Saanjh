"""
Factory Boy factories for the weddings module.
"""

import factory
from factory import fuzzy
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model

from weddings.models import Wedding

User = get_user_model()


class WeddingFactory(DjangoModelFactory):
    """Factory for creating Wedding instances."""
    
    class Meta:
        model = Wedding
    
    user = factory.SubFactory('tests.factories.accounts.UserFactory')
    title = factory.Faker('sentence', nb_words=4)
    bride_name = factory.Faker('first_name', female=True)
    groom_name = factory.Faker('first_name', male=True)
    wedding_date = factory.Faker('date_between', start_date='+30d', end_date='+365d')
    venue = factory.Faker('company')
    address = factory.Faker('address')
    budget = factory.Faker('pydecimal', left_digits=5, right_digits=2, positive=True)
    guest_count = fuzzy.FuzzyInteger(50, 300)
    theme = factory.Faker('word')
    description = factory.Faker('text', max_nb_chars=1000)
    is_active = True
