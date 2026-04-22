from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Vendor
from .serializers import (
    VendorSerializer, VendorCreateSerializer, VendorUpdateSerializer,
    VendorStatusUpdateSerializer
)

class VendorListCreateView(generics.ListCreateAPIView):
    """Vendor list and create endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['vendor_type', 'status', 'contract_signed']
    search_fields = ['name', 'contact_person', 'email', 'phone']
    ordering_fields = ['name', 'vendor_type', 'status', 'created_at']
    ordering = ['vendor_type', 'name']
    
    def get_queryset(self):
        return Vendor.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VendorCreateSerializer
        return VendorSerializer

class VendorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vendor detail, update, and delete endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Vendor.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return VendorUpdateSerializer
        return VendorSerializer

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def vendor_bulk_status_update(request):
    """Bulk update vendor status"""
    vendor_ids = request.data.get('vendor_ids', [])
    status = request.data.get('status')
    
    if not vendor_ids or not status:
        return Response(
            {'error': 'vendor_ids and status are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    from django.utils import timezone
    updated_count = Vendor.objects.filter(
        id__in=vendor_ids,
        wedding=request.user.wedding
    ).update(status=status, last_contact_date=timezone.now())
    
    return Response({
        'message': f'Updated {updated_count} vendors',
        'updated_count': updated_count
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def vendor_statistics(request):
    """Get vendor statistics"""
    try:
        wedding = request.user.wedding
        vendors = wedding.vendors.all()
        
        stats = {
            'total': vendors.count(),
            'pending': vendors.filter(status='pending').count(),
            'contacted': vendors.filter(status='contacted').count(),
            'confirmed': vendors.filter(status='confirmed').count(),
            'completed': vendors.filter(status='completed').count(),
            'cancelled': vendors.filter(status='cancelled').count(),
        }
        
        # Vendor type breakdown
        vendor_types = {}
        for vendor in vendors:
            vendor_type = vendor.get_vendor_type_display()
            vendor_types[vendor_type] = vendor_types.get(vendor_type, 0) + 1
        
        stats['by_type'] = vendor_types
        
        # Total cost
        total_cost = sum(vendor.cost or 0 for vendor in vendors)
        total_deposits = sum(vendor.deposit_paid or 0 for vendor in vendors)
        
        stats['total_cost'] = total_cost
        stats['total_deposits'] = total_deposits
        stats['remaining_balance'] = total_cost - total_deposits
        
        return Response(stats)
    except:
        return Response({
            'total': 0,
            'pending': 0,
            'contacted': 0,
            'confirmed': 0,
            'completed': 0,
            'cancelled': 0,
            'by_type': {},
            'total_cost': 0,
            'total_deposits': 0,
            'remaining_balance': 0
        })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def vendor_follow_ups(request):
    """Get vendors that need follow-up"""
    from django.utils import timezone
    today = timezone.now().date()
    
    vendors = Vendor.objects.filter(
        wedding=request.user.wedding,
        next_follow_up__lte=today,
        status__in=['pending', 'contacted']
    ).order_by('next_follow_up')
    
    serializer = VendorSerializer(vendors, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def vendor_mark_contacted(request, pk):
    """Mark vendor as contacted and set next follow-up"""
    try:
        vendor = Vendor.objects.get(
            pk=pk, 
            wedding=request.user.wedding
        )
        
        from django.utils import timezone
        vendor.last_contact_date = timezone.now()
        
        # Set next follow-up based on status
        if vendor.status == 'pending':
            vendor.next_follow_up = timezone.now().date() + timezone.timedelta(days=7)
        elif vendor.status == 'contacted':
            vendor.next_follow_up = timezone.now().date() + timezone.timedelta(days=14)
        
        vendor.save()
        
        return Response({
            'message': 'Vendor marked as contacted',
            'next_follow_up': vendor.next_follow_up
        })
    except Vendor.DoesNotExist:
        return Response(
            {'error': 'Vendor not found'},
            status=status.HTTP_404_NOT_FOUND
        )
