from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from .models import Wedding
from .serializers import WeddingSerializer, WeddingCreateSerializer, WeddingUpdateSerializer

class WeddingDetailView(generics.RetrieveUpdateAPIView):
    """Wedding detail view and update endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        wedding, created = Wedding.objects.get_or_create(user=self.request.user)
        return wedding
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return WeddingUpdateSerializer
        return WeddingSerializer

class WeddingCreateView(generics.CreateAPIView):
    """Create wedding endpoint"""
    serializer_class = WeddingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def wedding_dashboard(request):
    """Get wedding dashboard data"""
    try:
        wedding = request.user.wedding
        
        # Get guest statistics
        guests = wedding.guests.all()
        guest_stats = {
            'total': guests.count(),
            'confirmed': guests.filter(rsvp_status='confirmed').count(),
            'pending': guests.filter(rsvp_status='pending').count(),
            'declined': guests.filter(rsvp_status='declined').count(),
        }
        
        # Get vendor statistics
        vendors = wedding.vendors.all()
        vendor_stats = {
            'total': vendors.count(),
            'confirmed': vendors.filter(status='confirmed').count(),
            'pending': vendors.filter(status='pending').count(),
            'contacted': vendors.filter(status='contacted').count(),
        }
        
        # Get expense statistics
        expenses = wedding.expenses.all()
        total_expenses = sum(expense.actual_cost or expense.estimated_cost for expense in expenses)
        total_paid = sum(expense.amount_paid for expense in expenses)
        
        expense_stats = {
            'total_estimated': sum(expense.estimated_cost for expense in expenses),
            'total_actual': total_expenses,
            'total_paid': total_paid,
            'remaining': total_expenses - total_paid,
            'budget_used': (total_expenses / wedding.budget * 100) if wedding.budget else 0,
        }
        
        # Get recent activities
        recent_guests = guests.order_by('-added_date')[:5]
        recent_expenses = expenses.order_by('-created_at')[:5]
        recent_vendors = vendors.order_by('-updated_at')[:5]
        
        return Response({
            'wedding': WeddingSerializer(wedding).data,
            'guest_stats': guest_stats,
            'vendor_stats': vendor_stats,
            'expense_stats': expense_stats,
            'recent_activities': {
                'guests': [{'name': g.name, 'date': g.added_date, 'type': 'guest_added'} for g in recent_guests],
                'expenses': [{'description': e.description, 'date': e.created_at, 'type': 'expense_logged'} for e in recent_expenses],
                'vendors': [{'name': v.name, 'date': v.updated_at, 'type': 'vendor_updated'} for v in recent_vendors],
            }
        })
    except Wedding.DoesNotExist:
        return Response({'error': 'No wedding found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def wedding_timeline(request):
    """Get wedding timeline events"""
    try:
        wedding = request.user.wedding
        
        # Combine all events into a timeline
        events = []
        
        # Add guest events
        for guest in wedding.guests.all():
            events.append({
                'event': f'Guest {guest.name} added',
                'description': f'{guest.name} was added to the guest list',
                'date': guest.added_date,
                'type': 'guest'
            })
        
        # Add vendor events
        for vendor in wedding.vendors.all():
            events.append({
                'event': f'Vendor {vendor.name} - {vendor.get_status_display()}',
                'description': f'{vendor.name} ({vendor.get_vendor_type_display()}) - {vendor.get_status_display()}',
                'date': vendor.updated_at,
                'type': 'vendor'
            })
        
        # Add expense events
        for expense in wedding.expenses.all():
            events.append({
                'event': f'Expense: {expense.description}',
                'description': f'{expense.get_category_display()} - ${expense.actual_cost or expense.estimated_cost}',
                'date': expense.created_at,
                'type': 'expense'
            })
        
        # Sort events by date
        events.sort(key=lambda x: x['date'], reverse=True)
        
        return Response(events[:20])  # Return last 20 events
    except Wedding.DoesNotExist:
        return Response([], status=status.HTTP_200_OK)
