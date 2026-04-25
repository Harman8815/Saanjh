from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Guest, RsvpStatus, Table, Meal, GuestMeal
from .serializers import (
    GuestSerializer, GuestCreateSerializer, GuestUpdateSerializer,
    GuestBulkCreateSerializer, GuestRSVPUpdateSerializer,
    RsvpStatusSerializer, TableSerializer, TableCreateSerializer,
    MealSerializer
)
from utils.api_response import APIResponse

class RsvpStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for RsvpStatus model"""
    queryset = RsvpStatus.objects.all()
    serializer_class = RsvpStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "RSVP statuses retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "RSVP status created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "RSVP status retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "RSVP status updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "RSVP status deleted successfully")


class MealViewSet(viewsets.ModelViewSet):
    """ViewSet for Meal model"""
    queryset = Meal.objects.all()
    serializer_class = MealSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Meals retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Meal created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Meal retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Meal updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Meal deleted successfully")


class TableViewSet(viewsets.ModelViewSet):
    """ViewSet for Table model"""
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Table.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TableCreateSerializer
        return TableSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Tables retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Table created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Table retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Table updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Table deleted successfully")
    
    @action(detail=True, methods=['post'])
    def assign_guest(self, request, pk=None):
        """Assign a guest to this table"""
        table = self.get_object()
        guest_id = request.data.get('guest_id')
        
        if not guest_id:
            return APIResponse.error(
                "guest_id is required",
                ["Missing required field: guest_id"],
                status.HTTP_400_BAD_REQUEST
            )
        
        try:
            guest = Guest.objects.get(
                id=guest_id,
                wedding=self.request.user.wedding
            )
            
            # Check if table has capacity
            if table.assigned_guests.count() >= table.capacity:
                return APIResponse.error(
                    "Table is at full capacity",
                    ["Cannot assign more guests to this table"],
                    status.HTTP_400_BAD_REQUEST
                )
            
            guest.table = table
            guest.save()
            
            return APIResponse.success({}, "Guest assigned to table successfully")
        except Guest.DoesNotExist:
            return APIResponse.error(
                "Guest not found",
                ["The specified guest does not exist or is not accessible"],
                status.HTTP_404_NOT_FOUND
            )


class GuestViewSet(viewsets.ModelViewSet):
    """ViewSet for Guest model"""
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['rsvp_status', 'relationship', 'table']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['last_name', 'first_name', 'added_date']
    ordering = ['last_name', 'first_name']
    
    def get_queryset(self):
        return Guest.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return GuestCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return GuestUpdateSerializer
        return GuestSerializer
    
    def perform_create(self, serializer):
        serializer.save(wedding=self.request.user.wedding)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Guests retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Guest created successfully")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Guest retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Guest updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Guest deleted successfully")
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create guests"""
        serializer = GuestBulkCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            guests = serializer.save()
            return APIResponse.created(
                GuestSerializer(guests, many=True).data,
                "Guests created successfully"
            )
        return APIResponse.validation_error(
            [f"{field}: {', '.join(errors)}" for field, errors in serializer.errors.items()],
            "Guest bulk creation failed"
        )
    
    @action(detail=False, methods=['post'])
    def bulk_rsvp_update(self, request):
        """Bulk update RSVP status"""
        guest_ids = request.data.get('guest_ids', [])
        rsvp_status_id = request.data.get('rsvp_status_id')
        rsvp_date = request.data.get('rsvp_date')
        
        if not guest_ids or not rsvp_status_id:
            return APIResponse.error(
                "guest_ids and rsvp_status_id are required",
                ["Missing required fields: guest_ids and rsvp_status_id"],
                status.HTTP_400_BAD_REQUEST
            )
        
        updated_count = Guest.objects.filter(
            id__in=guest_ids,
            wedding=request.user.wedding
        ).update(rsvp_status_id=rsvp_status_id, rsvp_date=rsvp_date)
        
        return APIResponse.success({
            'updated_count': updated_count
        }, f"Updated {updated_count} guests successfully")


class GuestListCreateView(generics.ListCreateAPIView):
    """Guest list and create endpoint (legacy)"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['rsvp_status', 'relationship', 'invitation_sent']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['last_name', 'first_name', 'added_date', 'rsvp_status']
    ordering = ['last_name', 'first_name']
    
    def get_queryset(self):
        return Guest.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GuestCreateSerializer
        return GuestSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Guests retrieved successfully")
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(serializer.data, "Guest created successfully")

class GuestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Guest detail, update, and delete endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Guest.objects.filter(wedding=self.request.user.wedding)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return GuestUpdateSerializer
        return GuestSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(serializer.data, "Guest retrieved successfully")
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return APIResponse.success(serializer.data, "Guest updated successfully")
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Guest deleted successfully")

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
        return APIResponse.error(
            "guest_ids and rsvp_status are required",
            ["Missing required fields: guest_ids and rsvp_status"],
            status.HTTP_400_BAD_REQUEST
        )
    
    updated_count = Guest.objects.filter(
        id__in=guest_ids,
        wedding=request.user.wedding
    ).update(rsvp_status=rsvp_status, rsvp_date=rsvp_date)
    
    return APIResponse.success({
        'updated_count': updated_count
    }, f"Updated {updated_count} guests successfully")

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def guest_send_invitations(request):
    """Mark invitations as sent for selected guests"""
    guest_ids = request.data.get('guest_ids', [])
    
    if not guest_ids:
        return APIResponse.error(
            "guest_ids are required",
            ["Missing required field: guest_ids"],
            status.HTTP_400_BAD_REQUEST
        )
    
    from django.utils import timezone
    updated_count = Guest.objects.filter(
        id__in=guest_ids,
        wedding=request.user.wedding
    ).update(
        invitation_sent=True,
        invitation_sent_date=timezone.now()
    )
    
    return APIResponse.success({
        'updated_count': updated_count
    }, f"Marked {updated_count} invitations as sent successfully")

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def guest_statistics(request):
    """Get guest statistics"""
    try:
        wedding = request.user.wedding
        guests = wedding.guests.all()
        
        stats = {
            'total': guests.count(),
            'confirmed': guests.filter(rsvp_status__name='confirmed').count(),
            'pending': guests.filter(rsvp_status__name='pending').count(),
            'declined': guests.filter(rsvp_status__name='declined').count(),
            'invitations_sent': guests.filter(invitation_sent=True).count(),
            'reminders_sent': guests.filter(reminder_sent=True).count(),
        }
        
        # RSVP rate
        if stats['total'] > 0:
            stats['rsvp_rate'] = round((stats['confirmed'] / stats['total']) * 100, 2)
        else:
            stats['rsvp_rate'] = 0
        
        # Expected attendees (confirmed guests)
        stats['expected_attendees'] = stats['confirmed']
        
        return APIResponse.success(stats, "Statistics retrieved successfully")
    except:
        stats = {
            'total': 0,
            'confirmed': 0,
            'pending': 0,
            'declined': 0,
            'invitations_sent': 0,
            'reminders_sent': 0,
            'rsvp_rate': 0,
            'expected_attendees': 0
        }
        return APIResponse.success(stats, "Statistics retrieved successfully")

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def guest_export(request):
    """Export guest data"""
    guests = Guest.objects.filter(wedding=request.user.wedding)
    
    export_data = []
    for guest in guests:
        export_data.append({
            'name': guest.full_name,
            'email': guest.email,
            'phone': guest.phone,
            'rsvp_status': guest.rsvp_status.name if guest.rsvp_status else '',
            'relationship': guest.get_relationship_display(),
            'dietary_restrictions': guest.dietary_restrictions,
            'notes': guest.notes,
            'added_date': guest.added_date,
        })
    
    return APIResponse.success(export_data, "Guest data exported successfully")

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def seating_chart(request):
    """Get seating chart data"""
    try:
        wedding = request.user.wedding
        tables = wedding.tables.all().prefetch_related('assigned_guests')
        
        seating_data = []
        for table in tables:
            guests = table.assigned_guests.all()
            seating_data.append({
                'table': TableSerializer(table).data,
                'guests': GuestSerializer(guests, many=True).data
            })
        
        # Get unassigned guests
        unassigned_guests = Guest.objects.filter(
            wedding=wedding,
            table__isnull=True
        )
        
        return APIResponse.success({
            'tables': seating_data,
            'unassigned_guests': GuestSerializer(unassigned_guests, many=True).data
        }, "Seating chart retrieved successfully")
    except:
        return APIResponse.success({
            'tables': [],
            'unassigned_guests': []
        }, "Seating chart retrieved successfully")
