from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Q
from .models import Expense
from .serializers import (
    ExpenseSerializer, ExpenseCreateSerializer, ExpenseUpdateSerializer,
    ExpensePaymentUpdateSerializer
)

class ExpenseListCreateView(generics.ListCreateAPIView):
    """Expense list and create endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'payment_status', 'vendor']
    search_fields = ['description', 'notes']
    ordering_fields = ['expense_date', 'due_date', 'created_at', 'description']
    ordering = ['-expense_date']
    
    def get_queryset(self):
        return Expense.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ExpenseCreateSerializer
        return ExpenseSerializer

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Expense detail, update, and delete endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Expense.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ExpenseUpdateSerializer
        return ExpenseSerializer

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def expense_bulk_payment_update(request):
    """Bulk update payment status for multiple expenses"""
    expense_ids = request.data.get('expense_ids', [])
    payment_status = request.data.get('payment_status')
    paid_date = request.data.get('paid_date')
    
    if not expense_ids or not payment_status:
        return Response(
            {'error': 'expense_ids and payment_status are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    update_data = {'payment_status': payment_status}
    if paid_date:
        update_data['paid_date'] = paid_date
    
    updated_count = Expense.objects.filter(
        id__in=expense_ids,
        wedding=request.user.wedding
    ).update(**update_data)
    
    return Response({
        'message': f'Updated {updated_count} expenses',
        'updated_count': updated_count
    })

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
            'total_estimated': expenses.aggregate(total=Sum('estimated_cost'))['total'] or 0,
            'total_actual': expenses.aggregate(total=Sum('actual_cost'))['total'] or 0,
            'total_paid': expenses.aggregate(total=Sum('amount_paid'))['total'] or 0,
        }
        
        stats['remaining_balance'] = stats['total_actual'] - stats['total_paid']
        
        # Budget comparison
        if wedding.budget:
            stats['budget'] = wedding.budget
            stats['budget_used'] = (stats['total_actual'] / wedding.budget * 100)
            stats['budget_remaining'] = wedding.budget - stats['total_actual']
        else:
            stats['budget'] = 0
            stats['budget_used'] = 0
            stats['budget_remaining'] = 0
        
        # Payment status breakdown
        payment_stats = {}
        for expense in expenses:
            status = expense.get_payment_status_display()
            payment_stats[status] = payment_stats.get(status, 0) + 1
        stats['by_payment_status'] = payment_stats
        
        # Category breakdown
        category_stats = {}
        for expense in expenses:
            category = expense.get_category_display()
            if category not in category_stats:
                category_stats[category] = {
                    'count': 0,
                    'estimated': 0,
                    'actual': 0,
                    'paid': 0
                }
            category_stats[category]['count'] += 1
            category_stats[category]['estimated'] += expense.estimated_cost
            category_stats[category]['actual'] += expense.actual_cost or 0
            category_stats[category]['paid'] += expense.amount_paid
        
        stats['by_category'] = category_stats
        
        # Overdue expenses
        from django.utils import timezone
        today = timezone.now().date()
        overdue_expenses = expenses.filter(
            due_date__lt=today,
            payment_status__in=['pending', 'partial']
        ).count()
        stats['overdue_count'] = overdue_expenses
        
        return Response(stats)
    except:
        return Response({
            'total_expenses': 0,
            'total_estimated': 0,
            'total_actual': 0,
            'total_paid': 0,
            'remaining_balance': 0,
            'budget': 0,
            'budget_used': 0,
            'budget_remaining': 0,
            'by_payment_status': {},
            'by_category': {},
            'overdue_count': 0
        })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def expense_overdue(request):
    """Get overdue expenses"""
    from django.utils import timezone
    today = timezone.now().date()
    
    expenses = Expense.objects.filter(
        wedding=request.user.wedding,
        due_date__lt=today,
        payment_status__in=['pending', 'partial']
    ).order_by('due_date')
    
    serializer = ExpenseSerializer(expenses, many=True)
    return Response(serializer.data)

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
        payment_status__in=['pending', 'partial']
    ).order_by('due_date')
    
    serializer = ExpenseSerializer(expenses, many=True)
    return Response(serializer.data)

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
                'description': expense.description,
                'category': expense.get_category_display(),
                'amount': expense.actual_cost or expense.estimated_cost,
                'payment_status': expense.get_payment_status_display(),
                'date': expense.created_at
            })
        
        # Upcoming payments
        from django.utils import timezone
        today = timezone.now().date()
        upcoming_payments = expenses.filter(
            due_date__gte=today,
            payment_status__in=['pending', 'partial']
        ).order_by('due_date')[:5]
        
        upcoming_data = []
        for expense in upcoming_payments:
            upcoming_data.append({
                'id': expense.id,
                'description': expense.description,
                'due_date': expense.due_date,
                'amount': expense.actual_cost or expense.estimated_cost,
                'remaining_balance': expense.remaining_balance()
            })
        
        return Response({
            'recent_expenses': recent_data,
            'upcoming_payments': upcoming_data
        })
    except:
        return Response({
            'recent_expenses': [],
            'upcoming_payments': []
        })
