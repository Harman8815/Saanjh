from django.db import models
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from utils.api_response import APIResponse
from utils.api_response import get_request_wedding
from accounts.permissions import IsAdminOrReadOnly
from notifications.models import Reminder
from .models import (
    Vendor, VendorCategory, VendorStatus, VendorCatalog,
    VendorQuote, VendorContract, VendorMilestone, VendorCommunication
)
from .serializers import (
    VendorSerializer, VendorCreateSerializer, VendorUpdateSerializer,
    VendorStatusUpdateSerializer, VendorCategorySerializer,
    VendorStatusSerializer, VendorCatalogSerializer,
    VendorCatalogCreateSerializer, VendorQuoteSerializer,
    VendorContractSerializer, VendorMilestoneSerializer,
    VendorCommunicationSerializer
)

class VendorCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for VendorCategory model"""
    queryset = VendorCategory.objects.all()
    serializer_class = VendorCategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class VendorStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for VendorStatus model"""
    queryset = VendorStatus.objects.all()
    serializer_class = VendorStatusSerializer
    permission_classes = [IsAdminOrReadOnly]


class VendorCatalogViewSet(viewsets.ModelViewSet):
    """ViewSet for VendorCatalog model"""
    queryset = VendorCatalog.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    
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
    filterset_fields = ['status', 'vendor_catalog__category']
    search_fields = ['vendor_catalog__name', 'vendor_catalog__contact']
    ordering_fields = ['vendor_catalog__name', 'cost_estimate', 'actual_cost']
    ordering = ['vendor_catalog__category', 'vendor_catalog__name']
    
    def get_queryset(self):
        return Vendor.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VendorCreateSerializer
        return VendorSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, 'Vendors retrieved successfully')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.validation_error(serializer.errors)
        serializer.save(wedding=request.user.wedding)
        return APIResponse.created(serializer.data, 'Vendor created successfully')

class VendorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vendor detail, update, and delete endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Vendor.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return VendorUpdateSerializer
        return VendorSerializer

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return APIResponse.success(serializer.data, 'Vendor retrieved successfully')

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return APIResponse.validation_error(serializer.errors)
        serializer.save()
        return APIResponse.success(serializer.data, 'Vendor updated successfully')

    def destroy(self, request, *args, **kwargs):
        self.perform_destroy(self.get_object())
        return APIResponse.no_content()

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
        wedding = get_request_wedding(request)
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
    """Get vendors that need follow-up (either scheduled follow_up_date or in pending/contacted)"""
    wedding = request.user.wedding
    vendors = Vendor.objects.filter(
        wedding=wedding
    ).filter(
        models.Q(follow_up_date__isnull=False) |
        models.Q(status__name__in=['pending', 'contacted'])
    ).order_by('follow_up_date', 'vendor_catalog__category', 'vendor_catalog__name')
    
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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def vendor_schedule_follow_up(request, pk):
    """Schedule follow-up date and create a Reminder for vendor"""
    try:
        vendor = Vendor.objects.get(pk=pk, wedding=request.user.wedding)
    except Vendor.DoesNotExist:
        return Response({'error': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

    follow_up_date = request.data.get('follow_up_date')
    if not follow_up_date:
        return Response({'error': 'follow_up_date is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Parse date or datetime
    try:
        from datetime import datetime, time
        if 'T' in str(follow_up_date):
            scheduled_dt = datetime.fromisoformat(str(follow_up_date).replace('Z', '+00:00'))
            date_val = scheduled_dt.date()
        else:
            date_val = datetime.strptime(str(follow_up_date)[:10], '%Y-%m-%d').date()
            scheduled_dt = timezone.make_aware(datetime.combine(date_val, time(9, 0)))
    except Exception as e:
        return Response({'error': f'Invalid date format: {e}'}, status=status.HTTP_400_BAD_REQUEST)

    vendor.follow_up_date = date_val
    vendor.save(update_fields=['follow_up_date'])

    # Create reminder
    channel = request.data.get('channel', 'email')
    notes = request.data.get('notes', f"Scheduled follow-up for vendor {vendor.vendor_catalog.name if vendor.vendor_catalog else vendor.id}")
    vendor_name = vendor.vendor_catalog.name if vendor.vendor_catalog else f"Vendor #{vendor.id}"

    reminder = Reminder.objects.create(
        wedding=request.user.wedding,
        kind='vendor_follow_up',
        channel=channel if channel in ['email', 'in_app'] else 'email',
        target_type=ContentType.objects.get_for_model(vendor),
        target_id=vendor.id,
        to_email=request.user.email,
        subject=f"Follow-up reminder: {vendor_name}",
        message=notes,
        scheduled_for=scheduled_dt,
    )

    return Response({
        'message': 'Follow-up scheduled successfully',
        'follow_up_date': str(vendor.follow_up_date),
        'reminder_id': reminder.id
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def vendor_compare(request):
    """
    Compare multiple vendors side-by-side.
    Query param: ?ids=1,2,3
    """
    ids_param = request.GET.get('ids', '')
    if not ids_param:
        return Response({'error': 'ids query parameter is required (e.g. ?ids=1,2,3)'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        id_list = [int(i.strip()) for i in ids_param.split(',') if i.strip()]
    except ValueError:
        return Response({'error': 'ids must be a comma-separated list of integers'}, status=status.HTTP_400_BAD_REQUEST)

    if not id_list:
        return Response({'vendors': []})

    vendors = Vendor.objects.filter(
        wedding=request.user.wedding,
        id__in=id_list
    ).select_related(
        'vendor_catalog', 'vendor_catalog__category', 'status', 'contract'
    ).prefetch_related('quotes', 'milestones', 'expenses')

    result = []
    for v in vendors:
        contract_data = None
        if hasattr(v, 'contract') and v.contract:
            contract_data = {
                'id': v.contract.id,
                'signed_date': v.contract.signed_date,
                'expiry_date': v.contract.expiry_date,
                'deposit_amount': float(v.contract.deposit_amount),
                'deposit_paid': v.contract.deposit_paid,
                'document_id': v.contract.document_id,
            }

        milestones = list(v.milestones.all())
        milestones_paid = [m for m in milestones if m.paid]
        milestone_total = sum(m.amount for m in milestones)
        milestone_paid_total = sum(m.amount for m in milestones_paid)

        quotes = list(v.quotes.all())
        accepted_quote = next((q for q in quotes if q.status == 'accepted'), None)

        expenses = list(v.expenses.all())
        expense_total = sum(e.amount for e in expenses)
        expense_paid = sum(e.paid_amount for e in expenses)

        result.append({
            'id': v.id,
            'name': v.vendor_catalog.name if v.vendor_catalog else f'Vendor #{v.id}',
            'category': v.vendor_catalog.category.name if (v.vendor_catalog and v.vendor_catalog.category) else '',
            'contact': v.vendor_catalog.contact if v.vendor_catalog else '',
            'price_range': v.vendor_catalog.price_range if v.vendor_catalog else '',
            'rating': float(v.vendor_catalog.rating) if (v.vendor_catalog and v.vendor_catalog.rating) else None,
            'status': v.status.name if v.status else '',
            'cost_estimate': float(v.cost_estimate) if v.cost_estimate is not None else None,
            'actual_cost': float(v.actual_cost) if v.actual_cost is not None else None,
            'cost_variance': float(v.cost_variance) if v.cost_variance is not None else None,
            'follow_up_date': v.follow_up_date,
            'contract': contract_data,
            'quotes': {
                'total_count': len(quotes),
                'has_accepted': accepted_quote is not None,
                'accepted_amount': float(accepted_quote.amount) if accepted_quote else None,
                'latest_status': quotes[0].status if quotes else None,
            },
            'milestones': {
                'total_count': len(milestones),
                'paid_count': len(milestones_paid),
                'total_amount': float(milestone_total),
                'paid_amount': float(milestone_paid_total),
            },
            'expenses': {
                'total': float(expense_total),
                'paid': float(expense_paid),
            }
        })

    return Response({'vendors': result})


class VendorQuoteViewSet(viewsets.ModelViewSet):
    """ViewSet for VendorQuote model"""
    serializer_class = VendorQuoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = VendorQuote.objects.filter(vendor__wedding=self.request.user.wedding)
        vendor_id = self.request.query_params.get('vendor')
        if vendor_id:
            qs = qs.filter(vendor_id=vendor_id)
        return qs


class VendorContractViewSet(viewsets.ModelViewSet):
    """ViewSet for VendorContract model"""
    serializer_class = VendorContractSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = VendorContract.objects.filter(vendor__wedding=self.request.user.wedding)
        vendor_id = self.request.query_params.get('vendor')
        if vendor_id:
            qs = qs.filter(vendor_id=vendor_id)
        return qs


class VendorMilestoneViewSet(viewsets.ModelViewSet):
    """ViewSet for VendorMilestone model"""
    serializer_class = VendorMilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = VendorMilestone.objects.filter(vendor__wedding=self.request.user.wedding)
        vendor_id = self.request.query_params.get('vendor')
        if vendor_id:
            qs = qs.filter(vendor_id=vendor_id)
        return qs


class VendorCommunicationViewSet(viewsets.ModelViewSet):
    """ViewSet for VendorCommunication model"""
    serializer_class = VendorCommunicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = VendorCommunication.objects.filter(vendor__wedding=self.request.user.wedding)
        vendor_id = self.request.query_params.get('vendor')
        if vendor_id:
            qs = qs.filter(vendor_id=vendor_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

