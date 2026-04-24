"""
Factory Boy factories for the expenses module.
"""

import factory
from factory import fuzzy
from factory.django import DjangoModelFactory
from decimal import Decimal

from expenses.models import Expense, BudgetCategory, ExpenseStatus


class ExpenseStatusFactory(DjangoModelFactory):
    """Factory for creating ExpenseStatus instances."""
    
    class Meta:
        model = ExpenseStatus
    
    name = factory.Faker('word')
    description = factory.Faker('text', max_nb_chars=200)
    color = factory.Faker('hex_color')
    is_paid_status = fuzzy.FuzzyChoice([True, False])


class BudgetCategoryFactory(DjangoModelFactory):
    """Factory for creating BudgetCategory instances."""
    
    class Meta:
        model = BudgetCategory
    
    name = factory.Faker('word')
    description = factory.Faker('text', max_nb_chars=200)
    budget_amount = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True)
    spent_amount = factory.LazyAttribute(lambda obj: obj.budget_amount * fuzzy.FuzzyFloat(0, 1).fuzz())
    color = factory.Faker('hex_color')
    
    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Ensure wedding is set when creating budget category."""
        if 'wedding' not in kwargs:
            from .weddings import WeddingFactory
            wedding = WeddingFactory()
            kwargs['wedding'] = wedding
        return super()._create(model_class, *args, **kwargs)


class ExpenseFactory(DjangoModelFactory):
    """Factory for creating Expense instances."""
    
    class Meta:
        model = Expense
    
    title = factory.Faker('sentence', nb_words=4)
    description = factory.Faker('text', max_nb_chars=500)
    estimated_cost = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True)
    actual_cost = factory.LazyAttribute(lambda obj: obj.estimated_cost * fuzzy.FuzzyFloat(0.8, 1.2).fuzz())
    due_date = factory.Faker('date_between', start_date='+30d', end_date='+365d')
    expense_date = factory.Faker('date_between', start_date='-30d', end_date='today')
    notes = factory.Faker('text', max_nb_chars=1000)
    is_recurring = fuzzy.FuzzyChoice([True, False])
    
    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Ensure wedding is set when creating expense."""
        if 'wedding' not in kwargs:
            from .weddings import WeddingFactory
            wedding = WeddingFactory()
            kwargs['wedding'] = wedding
        return super()._create(model_class, *args, **kwargs)
    
    @factory.post_generation
    def budget_category(self, create, extracted, **kwargs):
        """Set budget category if provided, otherwise create one."""
        if extracted:
            self.budget_category = extracted
            self.save()
        elif create and not self.budget_category:
            from .weddings import WeddingFactory
            wedding = WeddingFactory() if not self.wedding else self.wedding
            category = BudgetCategoryFactory(wedding=wedding, **kwargs)
            self.budget_category = category
            self.save()
    
    @factory.post_generation
    def status(self, create, extracted, **kwargs):
        """Set status if provided, otherwise create one."""
        if extracted:
            self.status = extracted
            self.save()
        elif create and not self.status:
            status = ExpenseStatusFactory(**kwargs)
            self.status = status
            self.save()
