from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Q
from .models import Expense, BudgetCategory, ExpenseStatus
from .serializers import (
    ExpenseSerializer, ExpenseCreateSerializer, ExpenseUpdateSerializer,
    ExpensePaymentUpdateSerializer, BudgetCategorySerializer,
    BudgetCategoryCreateSerializer, BudgetCategoryUpdateSerializer,
    ExpenseStatusSerializer
)
from utils.api_response import APIResponse

class ExpenseStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for ExpenseStatus model"""
    queryset = ExpenseStatus.objects.all()
    serializer_class = ExpenseStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Expense statuses retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Expense status created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Expense status retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Expense status updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Expense status deleted successfully")


class BudgetCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for BudgetCategory model"""
    queryset = BudgetCategory.objects.all()
    serializer_class = BudgetCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return BudgetCategory.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BudgetCategoryCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BudgetCategoryUpdateSerializer
        return BudgetCategorySerializer
    
    def perform_create(self, serializer):
        serializer.save(wedding=self.request.user.wedding)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Budget categories retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Budget category created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Budget category retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Budget category updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Budget category deleted successfully")


class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for Expense model"""
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['budget_category', 'status', 'vendor']
    search_fields = ['title', 'notes']
    ordering_fields = ['expense_date', 'due_date', 'created_at', 'title']
    ordering = ['-expense_date']
    
    def get_queryset(self):
        return Expense.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ExpenseUpdateSerializer
        return ExpenseSerializer
    
    def perform_create(self, serializer):
        serializer.save(wedding=self.request.user.wedding)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Expenses retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Expense created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Expense retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Expense updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Expense deleted successfully")
    
    @action(detail=False, methods=['post'])
    def bulk_payment_update(self, request):
        """Bulk update payment status for multiple expenses"""
        expense_ids = request.data.get('expense_ids', [])
        paid_amount = request.data.get('paid_amount')
        status_id = request.data.get('status_id')
        paid_date = request.data.get('paid_date')
        
        if not expense_ids or not status_id:
            return APIResponse.error(
                "expense_ids and status_id are required",
                ["Missing required fields: expense_ids and status_id"],
                status.HTTP_400_BAD_REQUEST
            )
        
        updated_count = Expense.objects.filter(
            id__in=expense_ids,
            wedding=request.user.wedding
        ).update(paid_amount=paid_amount, status_id=status_id, paid_date=paid_date)
        
        return APIResponse.success({
            'updated_count': updated_count
        }, f"Updated {updated_count} expenses successfully")


class ExpenseListCreateView(generics.ListCreateAPIView):
    """Expense list and create endpoint (legacy)"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['budget_category', 'status', 'vendor']
    search_fields = ['title', 'notes']
    ordering_fields = ['expense_date', 'due_date', 'created_at', 'title']
    ordering = ['-expense_date']
    
    def get_queryset(self):
        return Expense.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ExpenseCreateSerializer
        return ExpenseSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Expenses retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Expense created successfully")

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Expense detail, update, and delete endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Expense.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ExpenseUpdateSerializer
        return ExpenseSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Expense retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Expense updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Expense deleted successfully")

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def expense_bulk_payment_update(request):
    """Bulk update payment status for multiple expenses"""
    expense_ids = request.data.get('expense_ids', [])
    status_id = request.data.get('status_id')
    paid_amount = request.data.get('paid_amount')
    paid_date = request.data.get('paid_date')
    
    if not expense_ids or not status_id:
        return APIResponse.error(
            "expense_ids and status_id are required",
            ["Missing required fields: expense_ids and status_id"],
            status.HTTP_400_BAD_REQUEST
        )
    
    update_data = {'status_id': status_id}
    if paid_amount is not None:
        update_data['paid_amount'] = paid_amount
    if paid_date:
        update_data['paid_date'] = paid_date
    
    updated_count = Expense.objects.filter(
        id__in=expense_ids,
        wedding=request.user.wedding
    ).update(**update_data)
    
    return APIResponse.success({
        'updated_count': updated_count
    }, f"Updated {updated_count} expenses successfully")

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def expense_statistics(request):
    """Get expense statistics"""
    try:
        wedding = request.user.wedding
        expenses = wedding.expenses.all()
        
        # Basic statistics
        stats = {
            'total_expenses': expenses.count(),
            'total_amount': expenses.aggregate(total=Sum('amount'))['total'] or 0,
            'total_paid': expenses.aggregate(total=Sum('paid_amount'))['total'] or 0,
        }
        
        stats['remaining_balance'] = stats['total_amount'] - stats['total_paid']
        
        # Budget comparison
        total_budget = wedding.budget_categories.aggregate(total=Sum('allocated_amount'))['total'] or 0
        stats['total_budget'] = total_budget
        if total_budget > 0:
            stats['budget_used'] = (stats['total_paid'] / total_budget * 100)
            stats['budget_remaining'] = total_budget - stats['total_paid']
        else:
            stats['budget_used'] = 0
            stats['budget_remaining'] = 0
        
        # Status breakdown
        status_stats = {}
        for expense in expenses:
            if expense.status:
                status_name = expense.status.name
                status_stats[status_name] = status_stats.get(status_name, 0) + 1
        stats['by_status'] = status_stats
        
        # Category breakdown
        category_stats = {}
        for expense in expenses:
            if expense.budget_category:
                category = expense.budget_category.name
                if category not in category_stats:
                    category_stats[category] = {
                        'count': 0,
                        'amount': 0,
                        'paid': 0
                    }
                category_stats[category]['count'] += 1
                category_stats[category]['amount'] += expense.amount
                category_stats[category]['paid'] += expense.paid_amount
        
        stats['by_category'] = category_stats
        
        # Overdue expenses
        from django.utils import timezone
        today = timezone.now().date()
        overdue_expenses = expenses.filter(
            due_date__lt=today,
            status__name__in=['pending', 'partial']
        ).count()
        stats['overdue_count'] = overdue_expenses
        
        return APIResponse.success(stats, "Statistics retrieved successfully")
    except:
        stats = {
            'total_expenses': 0,
            'total_amount': 0,
            'total_paid': 0,
            'remaining_balance': 0,
            'total_budget': 0,
            'budget_used': 0,
            'budget_remaining': 0,
            'by_status': {},
            'by_category': {},
            'overdue_count': 0
        }
        return APIResponse.success(stats, "Statistics retrieved successfully")

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def expense_overdue(request):
    """Get overdue expenses"""
    from django.utils import timezone
    today = timezone.now().date()
    
    expenses = Expense.objects.filter(
        wedding=request.user.wedding,
        due_date__lt=today,
        status__name__in=['pending', 'partial']
    ).order_by('due_date')
    
    serializer = ExpenseSerializer(expenses, many=True)
    return APIResponse.success(serializer.data, "Overdue expenses retrieved successfully")

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def expense_upcoming(request):
    """Get upcoming expenses (due in next 30 days)"""
    from django.utils import timezone
    today = timezone.now().date()
    thirty_days_later = today + timezone.timedelta(days=30)
    
    expenses = Expense.objects.filter(
        wedding=request.user.wedding,
        due_date__gte=today,
        due_date__lte=thirty_days_later,
        status__name__in=['pending', 'partial']
    ).order_by('due_date')
    
    serializer = ExpenseSerializer(expenses, many=True)
    return APIResponse.success(serializer.data, "Upcoming expenses retrieved successfully")

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def expense_summary(request):
    """Get expense summary for dashboard"""
    try:
        wedding = request.user.wedding
        expenses = wedding.expenses.all()
        
        # Recent expenses
        recent_expenses = expenses.order_by('-created_at')[:5]
        recent_data = []
        for expense in recent_expenses:
            recent_data.append({
                'id': expense.id,
                'title': expense.title,
                'category': expense.budget_category.name if expense.budget_category else '',
                'amount': expense.amount,
                'status': expense.status.name if expense.status else '',
                'date': expense.created_at
            })
        
        # Upcoming payments
        from django.utils import timezone
        today = timezone.now().date()
        upcoming_payments = expenses.filter(
            due_date__gte=today,
            status__name__in=['pending', 'partial']
        ).order_by('due_date')[:5]
        
        upcoming_data = []
        for expense in upcoming_payments:
            upcoming_data.append({
                'id': expense.id,
                'title': expense.title,
                'due_date': expense.due_date,
                'amount': expense.amount,
                'remaining_balance': expense.remaining_balance()
            })
        
        return APIResponse.success({
            'recent_expenses': recent_data,
            'upcoming_payments': upcoming_data
        }, "Expense summary retrieved successfully")
    except:
        return APIResponse.success({
            'recent_expenses': [],
            'upcoming_payments': []
        }, "Expense summary retrieved successfully")
