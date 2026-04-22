from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Guest
from .serializers import (
    GuestSerializer, GuestCreateSerializer, GuestUpdateSerializer,
    GuestBulkCreateSerializer, GuestRSVPUpdateSerializer
)

class GuestListCreateView(generics.ListCreateAPIView):
    """Guest list and create endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['rsvp_status', 'relationship', 'invitation_sent']
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['name', 'added_date', 'rsvp_status']
    ordering = ['name']
    
    def get_queryset(self):
        return Guest.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GuestCreateSerializer
        return GuestSerializer

class GuestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Guest detail, update, and delete endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Guest.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return GuestUpdateSerializer
        return GuestSerializer

class GuestBulkCreateView(generics.CreateAPIView):
    """Bulk create guests endpoint"""
    serializer_class = GuestBulkCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def guest_bulk_rsvp_update(request):
    """Bulk update RSVP status for multiple guests"""
    guest_ids = request.data.get('guest_ids', [])
    rsvp_status = request.data.get('rsvp_status')
    rsvp_date = request.data.get('rsvp_date')
    
    if not guest_ids or not rsvp_status:
        return Response(
            {'error': 'guest_ids and rsvp_status are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    updated_count = Guest.objects.filter(
        id__in=guest_ids,
        wedding=request.user.wedding
    ).update(rsvp_status=rsvp_status, rsvp_date=rsvp_date)
    
    return Response({
        'message': f'Updated {updated_count} guests',
        'updated_count': updated_count
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def guest_send_invitations(request):
    """Mark invitations as sent for selected guests"""
    guest_ids = request.data.get('guest_ids', [])
    
    if not guest_ids:
        return Response(
            {'error': 'guest_ids are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    from django.utils import timezone
    updated_count = Guest.objects.filter(
        id__in=guest_ids,
        wedding=request.user.wedding
    ).update(
        invitation_sent=True,
        invitation_sent_date=timezone.now()
    )
    
    return Response({
        'message': f'Marked {updated_count} invitations as sent',
        'updated_count': updated_count
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def guest_statistics(request):
    """Get guest statistics"""
    try:
        wedding = request.user.wedding
        guests = wedding.guests.all()
        
        stats = {
            'total': guests.count(),
            'confirmed': guests.filter(rsvp_status='confirmed').count(),
            'pending': guests.filter(rsvp_status='pending').count(),
            'declined': guests.filter(rsvp_status='declined').count(),
            'with_plus_one': guests.filter(plus_one=True).count(),
            'invitations_sent': guests.filter(invitation_sent=True).count(),
            'reminders_sent': guests.filter(reminder_sent=True).count(),
        }
        
        # RSVP rate
        if stats['total'] > 0:
            stats['rsvp_rate'] = round((stats['confirmed'] / stats['total']) * 100, 2)
        else:
            stats['rsvp_rate'] = 0
        
        # Guest count with plus ones
        stats['expected_attendees'] = stats['confirmed'] + guests.filter(
            rsvp_status='confirmed', plus_one=True
        ).count()
        
        return Response(stats)
    except:
        return Response({
            'total': 0,
            'confirmed': 0,
            'pending': 0,
            'declined': 0,
            'with_plus_one': 0,
            'invitations_sent': 0,
            'reminders_sent': 0,
            'rsvp_rate': 0,
            'expected_attendees': 0
        })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def guest_export(request):
    """Export guest data"""
    guests = Guest.objects.filter(wedding=request.user.wedding)
    
    export_data = []
    for guest in guests:
        export_data.append({
            'name': guest.name,
            'email': guest.email,
            'phone': guest.phone,
            'rsvp_status': guest.get_rsvp_status_display(),
            'relationship': guest.get_relationship_display(),
            'plus_one': guest.plus_one,
            'plus_one_name': guest.plus_one_name,
            'dietary_restrictions': guest.dietary_restrictions,
            'notes': guest.notes,
            'added_date': guest.added_date,
        })
    
    return Response(export_data)
