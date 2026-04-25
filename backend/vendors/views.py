from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Vendor, VendorCategory, VendorStatus, VendorCatalog
from .serializers import (
    VendorSerializer, VendorCreateSerializer, VendorUpdateSerializer,
    VendorStatusUpdateSerializer, VendorCategorySerializer,
    VendorStatusSerializer, VendorCatalogSerializer,
    VendorCatalogCreateSerializer
)

class VendorCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for VendorCategory model"""
    queryset = VendorCategory.objects.all()
    serializer_class = VendorCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class VendorStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for VendorStatus model"""
    queryset = VendorStatus.objects.all()
    serializer_class = VendorStatusSerializer
    permission_classes = [permissions.IsAuthenticated]


class VendorCatalogViewSet(viewsets.ModelViewSet):
    """ViewSet for VendorCatalog model"""
    queryset = VendorCatalog.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VendorCatalogCreateSerializer
        return VendorCatalogSerializer
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get vendors by category"""
        category_id = request.GET.get('category_id')
        if not category_id:
            return Response(
                {'error': 'category_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        vendors = self.get_queryset().filter(category_id=category_id)
        serializer = self.get_serializer(vendors, many=True)
        return Response(serializer.data)


class VendorViewSet(viewsets.ModelViewSet):
    """ViewSet for Vendor model"""
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'vendor_catalog__category']
    search_fields = ['vendor_catalog__name', 'vendor_catalog__contact']
    ordering_fields = ['vendor_catalog__name', 'created_at']
    ordering = ['vendor_catalog__category', 'vendor_catalog__name']
    
    def get_queryset(self):
        return Vendor.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VendorCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return VendorUpdateSerializer
        return VendorSerializer
    
    def perform_create(self, serializer):
        serializer.save(wedding=self.request.user.wedding)
    
    @action(detail=False, methods=['post'])
    def bulk_status_update(self, request):
        """Bulk update vendor status"""
        vendor_ids = request.data.get('vendor_ids', [])
        status_id = request.data.get('status_id')
        
        if not vendor_ids or not status_id:
            return Response(
                {'error': 'vendor_ids and status_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_count = Vendor.objects.filter(
            id__in=vendor_ids,
            wedding=request.user.wedding
        ).update(status_id=status_id)
        
        return Response({
            'message': f'Updated {updated_count} vendors',
            'updated_count': updated_count
        })


class VendorListCreateView(generics.ListCreateAPIView):
    """Vendor list and create endpoint (legacy)"""
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
    status_id = request.data.get('status_id')
    
    if not vendor_ids or not status_id:
        return Response(
            {'error': 'vendor_ids and status_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    updated_count = Vendor.objects.filter(
        id__in=vendor_ids,
        wedding=request.user.wedding
    ).update(status_id=status_id)
    
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
            'pending': vendors.filter(status__name='pending').count(),
            'contacted': vendors.filter(status__name='contacted').count(),
            'confirmed': vendors.filter(status__name='confirmed').count(),
            'completed': vendors.filter(status__name='completed').count(),
            'cancelled': vendors.filter(status__name='cancelled').count(),
        }
        
        # Vendor category breakdown
        vendor_categories = {}
        for vendor in vendors:
            if vendor.vendor_catalog and vendor.vendor_catalog.category:
                category = vendor.vendor_catalog.category.name
                vendor_categories[category] = vendor_categories.get(category, 0) + 1
        
        stats['by_category'] = vendor_categories
        
        # Total cost
        total_cost = sum(vendor.cost_estimate or 0 for vendor in vendors)
        total_paid = sum(vendor.actual_cost or 0 for vendor in vendors)
        
        stats['total_cost'] = total_cost
        stats['total_paid'] = total_paid
        stats['remaining_balance'] = total_cost - total_paid
        
        return Response(stats)
    except:
        return Response({
            'total': 0,
            'pending': 0,
            'contacted': 0,
            'confirmed': 0,
            'completed': 0,
            'cancelled': 0,
            'by_category': {},
            'total_cost': 0,
            'total_paid': 0,
            'remaining_balance': 0
        })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def vendor_follow_ups(request):
    """Get vendors that need follow-up"""
    vendors = Vendor.objects.filter(
        wedding=request.user.wedding,
        status__name__in=['pending', 'contacted']
    ).order_by('vendor_catalog__category', 'vendor_catalog__name')
    
    serializer = VendorSerializer(vendors, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def vendor_mark_contacted(request, pk):
    """Mark vendor as contacted"""
    try:
        vendor = Vendor.objects.get(
            pk=pk, 
            wedding=request.user.wedding
        )
        
        # Update status to contacted
        from .models import VendorStatus
        contacted_status = VendorStatus.objects.get(name='contacted')
        vendor.status = contacted_status
        vendor.save()
        
        return Response({
            'message': 'Vendor marked as contacted'
        })
    except Vendor.DoesNotExist:
        return Response(
            {'error': 'Vendor not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except VendorStatus.DoesNotExist:
        return Response(
            {'error': 'Contacted status not found'},
            status=status.HTTP_400_BAD_REQUEST
        )
