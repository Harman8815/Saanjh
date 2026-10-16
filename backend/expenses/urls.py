from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'expenses', views.ExpenseViewSet)
router.register(r'budget-categories', views.BudgetCategoryViewSet)
router.register(r'expense-status', views.ExpenseStatusViewSet)
router.register(r'payment-schedules', views.PaymentScheduleViewSet, basename='payment-schedule')
router.register(r'expense-receipts', views.ExpenseReceiptViewSet, basename='expense-receipt')

urlpatterns = [
    path('', views.ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('<int:pk>/', views.ExpenseDetailView.as_view(), name='expense-detail'),
    path('bulk-payment-update/', views.expense_bulk_payment_update, name='expense-bulk-payment-update'),
    path('statistics/', views.expense_statistics, name='expense-statistics'),
    path('overdue/', views.expense_overdue, name='expense-overdue'),
    path('upcoming/', views.expense_upcoming, name='expense-upcoming'),
    path('summary/', views.expense_summary, name='expense-summary'),
    path('export/', views.expense_export, name='expense-export'),
    path('', include(router.urls)),
]
