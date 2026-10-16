"""
Factory Boy factories for the expenses module.

ExpenseStatus has only a unique name; BudgetCategory uses allocated_amount;
Expense uses title/amount/paid_amount and foreign keys for its relations.
"""

import factory
from factory import fuzzy
from factory.django import DjangoModelFactory
from decimal import Decimal

from expenses.models import Expense, BudgetCategory, ExpenseStatus


class ExpenseStatusFactory(DjangoModelFactory):
    """Factory for creating ExpenseStatus instances (unique name only)."""

    class Meta:
        model = ExpenseStatus
        django_get_or_create = ('name',)

    name = fuzzy.FuzzyChoice(['pending', 'partial', 'paid', 'overdue'])


class BudgetCategoryFactory(DjangoModelFactory):
    """Factory for creating BudgetCategory instances."""

    class Meta:
        model = BudgetCategory

    wedding = factory.SubFactory('tests.factories.weddings.WeddingFactory')
    name = factory.Sequence(lambda n: f'Category {n}')
    allocated_amount = factory.Faker(
        'pydecimal', left_digits=5, right_digits=2, positive=True,
        max_value=20000,
    )

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Ensure wedding is set when creating a budget category."""
        if not kwargs.get('wedding'):
            from .weddings import WeddingFactory
            kwargs['wedding'] = WeddingFactory()
        return super()._create(model_class, *args, **kwargs)


class ExpenseFactory(DjangoModelFactory):
    """Factory for creating Expense instances."""

    class Meta:
        model = Expense

    wedding = factory.SubFactory('tests.factories.weddings.WeddingFactory')
    budget_category = factory.SubFactory(BudgetCategoryFactory)
    status = factory.SubFactory(ExpenseStatusFactory)
    title = factory.Sequence(lambda n: f'Expense {n}')
    amount = factory.Faker(
        'pydecimal', left_digits=5, right_digits=2, positive=True,
        max_value=5000,
    )
    paid_amount = factory.LazyAttribute(
        lambda obj: (obj.amount * Decimal('0.5')).quantize(Decimal('0.01'))
    )
    expense_date = factory.Faker('date_between', start_date='-30d', end_date='today')
    due_date = factory.Faker('date_between', start_date='+30d', end_date='+365d')
    notes = factory.Faker('sentence', nb_words=8)

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Ensure wedding is set when creating an expense."""
        if not kwargs.get('wedding'):
            from .weddings import WeddingFactory
            kwargs['wedding'] = WeddingFactory()
        return super()._create(model_class, *args, **kwargs)
