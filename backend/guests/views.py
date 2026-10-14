from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import (
    Guest, RsvpStatus, Table, Meal, GuestMeal,
    GuestGroup, DietaryOption
)
from .serializers import (
    GuestSerializer, GuestCreateSerializer, GuestUpdateSerializer,
    GuestBulkCreateSerializer, GuestRSVPUpdateSerializer,
    RsvpStatusSerializer, TableSerializer, TableCreateSerializer,
    MealSerializer, GuestGroupSerializer, GuestGroupCreateSerializer,
    GuestGroupUpdateSerializer, DietaryOptionSerializer
)
from . import imports as guest_imports
# Imported by name (not as a module alias): the duplicate-detection view is
# itself called guest_duplicates, which would shadow a module alias.
from .duplicates import find_duplicate_clusters
from .seating import (
    auto_assign_seats, table_remaining_capacity, venue_capacity
)
from utils.api_response import APIResponse
from utils.api_response import get_request_wedding
from utils.api_exceptions import handle_api_exceptions
from utils.exports import write_csv, write_xlsx
from utils.uploads import max_upload_size_bytes
from accounts.permissions import IsAdminOrReadOnly

class RsvpStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for RsvpStatus model"""
    queryset = RsvpStatus.objects.all()
    serializer_class = RsvpStatusSerializer
    permission_classes = [IsAdminOrReadOnly]
    
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
    permission_classes = [IsAdminOrReadOnly]
    
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


class GuestGroupViewSet(viewsets.ModelViewSet):
    """ViewSet for guest groups (scoped to the request wedding)."""
    serializer_class = GuestGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            return GuestGroup.objects.filter(wedding=self.request.user.wedding)
        except Exception:
            return GuestGroup.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return GuestGroupCreateSerializer
        if self.action in ('update', 'partial_update'):
            return GuestGroupUpdateSerializer
        return GuestGroupSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(serializer.data, "Guest groups retrieved successfully")

    def create(self, request, *args, **kwargs):
        serializer = GuestGroupCreateSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return APIResponse.created(
            GuestGroupSerializer(group).data, "Guest group created successfully"
        )

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return APIResponse.success(serializer.data, "Guest group retrieved successfully")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return APIResponse.success(
            GuestGroupSerializer(instance).data, "Guest group updated successfully"
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Guest group deleted successfully")


class DietaryOptionViewSet(viewsets.ModelViewSet):
    """ViewSet for global dietary options (admin-write)."""
    queryset = DietaryOption.objects.all()
    serializer_class = DietaryOptionSerializer
    permission_classes = [IsAdminOrReadOnly]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(
            serializer.data, "Dietary options retrieved successfully"
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(
            serializer.data, "Dietary option created successfully"
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.success({}, "Dietary option deleted successfully")


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

    @action(detail=True, methods=['post'])
    def bulk_assign(self, request, pk=None):
        """
        Assign several guests to this table in one request.

        Every guest must belong to the request wedding, and the table's
        capacity (the same guard as assign_guest) is enforced for the batch
        as a whole, so none of the assignments can overfill the table.
        """
        table = self.get_object()
        guest_ids = request.data.get('guest_ids', [])

        if not isinstance(guest_ids, list) or not guest_ids:
            return APIResponse.error(
                "guest_ids must be a non-empty list",
                ["Provide the ids of the guests to seat at this table"],
                status.HTTP_400_BAD_REQUEST
            )

        guests = list(
            Guest.objects.filter(id__in=guest_ids, wedding=request.user.wedding)
        )
        if len(guests) != len(set(guest_ids)):
            return APIResponse.error(
                "Some guests were not found",
                ["Every guest id must reference a guest in this wedding"],
                status.HTTP_404_NOT_FOUND
            )

        available = table_remaining_capacity(table)
        if len(guests) > available:
            return APIResponse.error(
                f"Table only has {available} free seat(s)",
                [f"Requested {len(guests)} seats, {available} available"],
                status.HTTP_400_BAD_REQUEST
            )

        assigned = 0
        for guest in guests:
            guest.table = table
            # Individual save() so Guest.save() runs for each row.
            guest.save()
            assigned += 1

        return APIResponse.success(
            {'assigned_count': assigned},
            f"Assigned {assigned} guests to table {table.table_number}"
        )


class GuestViewSet(viewsets.ModelViewSet):
    """ViewSet for Guest model"""
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['rsvp_status', 'relationship', 'table', 'group']
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
        # Respond with the full read serializer so the client gets the new id
        # and nested relations (group, dietary preferences, ...).
        return APIResponse.created(
            GuestSerializer(serializer.instance).data,
            "Guest created successfully"
        )
    
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
        return APIResponse.created(
            GuestSerializer(serializer.instance).data,
            "Guest created successfully"
        )

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
    # get_request_wedding turns a missing wedding into a clean 404, so the
    # empty-instead-of-swallowed fallback below is gone with this handler's
    # bare except.
    wedding = get_request_wedding(request)
    guests = wedding.guests.all()

    stats = {
        'total': guests.count(),
        'confirmed': guests.filter(rsvp_status__name__iexact='confirmed').count(),
        'pending': guests.filter(rsvp_status__name__iexact='pending').count(),
        'declined': guests.filter(rsvp_status__name__iexact='declined').count(),
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

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@handle_api_exceptions
def guest_export(request):
    """Export guest data"""
    # get_request_wedding converts a missing wedding into a clean 404 instead
    # of the RelatedObjectDoesNotExist that would surface as a 500.
    wedding = get_request_wedding(request)

    guests = Guest.objects.filter(wedding=wedding)
    
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
    # The previous bare except turned every failure (including "no wedding")
    # into an empty seating chart; it now raises through the decorator.
    wedding = get_request_wedding(request)
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
        'unassigned_guests': GuestSerializer(unassigned_guests, many=True).data,
        'venue_capacity': venue_capacity(wedding),
    }, "Seating chart retrieved successfully")


# ---------------------------------------------------------------------------
# Stage 2: duplicate detection, import, bulk update, reminders, auto-seating
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def guest_duplicates(request):
    """Score and cluster probable duplicate guests."""
    wedding = get_request_wedding(request)

    clusters = find_duplicate_clusters(wedding)

    return APIResponse.success({
        'clusters': clusters,
        'cluster_count': len(clusters),
    }, "Duplicate analysis completed")


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def guest_import_preview(request):
    """
    Preview a guest-list import: parse, validate per row, cache the result.

    The response carries a token the client returns on commit; the validated
    rows live server-side, so the confirm step never trusts rows that
    round-tripped through the browser.
    """
    wedding = get_request_wedding(request)

    upload = request.FILES.get('file')
    if not upload:
        return APIResponse.error(
            "A file is required",
            ["Attach the spreadsheet as the 'file' form field"],
            status.HTTP_400_BAD_REQUEST
        )

    rows = guest_imports.parse_spreadsheet(upload)
    previews = guest_imports.validate_rows(rows, wedding)

    token = guest_imports.new_import_token()
    guest_imports.cache_import_token(token, previews)

    return APIResponse.success({
        'token': token,
        'summary': guest_imports.import_preview_summary(previews),
        'rows': previews,
        'max_rows': guest_imports.MAX_IMPORT_ROWS,
    }, "Import preview ready")


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def guest_import_commit(request):
    """
    Commit a previously previewed import using its cached token.

    ``token`` is required; an unknown or expired token is a 404 rather than
    a silent empty import.
    """
    wedding = get_request_wedding(request)

    token = request.data.get('token')
    if not token:
        return APIResponse.error(
            "A preview token is required",
            ["Preview the file first, then commit with the returned token"],
            status.HTTP_400_BAD_REQUEST
        )

    previews = guest_imports.get_cached_import(token)
    if previews is None:
        return APIResponse.error(
            "Preview expired or unknown",
            ["Preview the file again to start a fresh import"],
            status.HTTP_404_NOT_FOUND
        )

    result = guest_imports.commit_valid_rows(wedding, previews)
    guest_imports.clear_cached_import(token)

    return APIResponse.success(result, "Import completed")


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def guest_import_template(request):
    """
    Download the canonical import template (.csv or .xlsx).

    The format is selected with ``?type=csv`` (the default) or
    ``?type=xlsx``. The parameter is deliberately NOT called ``format``,
    which DRF's content negotiation reserves: ``?format=...`` never reaches
    the view and fails with a 404.
    """
    wedding = get_request_wedding(request)

    export_format = request.query_params.get('type', 'csv').lower()
    headers = [header for _key, header in guest_imports.GUEST_IMPORT_HEADERS]
    sample_rows = [[
        'Jane', 'Smith', 'jane.smith@example.com', '5551234567',
        'friend', 'pending', 'Vegetarian', '1 Test Street', 'Bride side coworker',
        'College friends',
    ]]

    if export_format == 'xlsx':
        response = write_xlsx(
            sample_rows, headers,
            filename='guest-import-template.xlsx',
            sheet_name='Guests',
        )
    else:
        export_format = 'csv'
        response = write_csv(
            sample_rows, headers, filename='guest-import-template.csv'
        )
    response['X-Export-Format'] = export_format
    return response


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def guest_bulk_update(request):
    """
    Bulk update fields on many guests.

    Uses an explicit allowlist (rsvp_status_id, table_id, relationship,
    group_id, invitation_sent, dietary_ids, notes) and iterates rows instead
    of calling .update(), so Guest.save() runs for each guest exactly as it
    does for single edits.
    """
    wedding = get_request_wedding(request)

    guest_ids = request.data.get('guest_ids', [])
    updates = request.data.get('updates', {})

    if not isinstance(guest_ids, list) or not guest_ids:
        return APIResponse.error(
            "guest_ids must be a non-empty list",
            ["Provide the ids of the guests to update"],
            status.HTTP_400_BAD_REQUEST
        )
    if not isinstance(updates, dict) or not updates:
        return APIResponse.error(
            "updates must be a non-empty object",
            ["Provide the fields to change, e.g. {'invitation_sent': true}"],
            status.HTTP_400_BAD_REQUEST
        )

    allowed_fields = {
        'rsvp_status_id', 'table_id', 'relationship', 'group_id',
        'invitation_sent', 'dietary_ids', 'notes', 'reminder_sent',
    }
    unknown = sorted(set(updates) - allowed_fields)
    if unknown:
        return APIResponse.error(
            "Unknown update fields",
            [
                f"Not allowed: {', '.join(unknown)}. "
                f"Allowed: {', '.join(sorted(allowed_fields))}"
            ],
            status.HTTP_400_BAD_REQUEST
        )

    # Validate the update payload against the same rules as a single edit,
    # with the first touching guest standing in for the instance.
    guests = list(Guest.objects.filter(id__in=guest_ids, wedding=wedding))
    if not guests:
        return APIResponse.error(
            "No matching guests",
            ["Every guest id must reference a guest in this wedding"],
            status.HTTP_404_NOT_FOUND
        )

    dietary_ids = updates.pop('dietary_ids', None)
    serializer = GuestUpdateSerializer(
        guests[0], data={**updates}, partial=True, context={'request': request}
    )
    serializer.is_valid(raise_exception=True)
    validated = serializer.validated_data

    updated = 0
    for guest in guests:
        for field, value in validated.items():
            setattr(guest, field, value)
        guest.save()
        if dietary_ids is not None:
            guest.dietary_preferences.all().delete()
            for option_id in dietary_ids:
                guest.dietary_preferences.create(option_id=option_id)
        updated += 1

    return APIResponse.success(
        {'updated_count': updated},
        f"Updated {updated} guests successfully"
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def guest_reminders_schedule(request):
    """
    Schedule RSVP reminders for selected pending guests.

    Creates one notifications.Reminder per guest (snapshotting each guest's
    email) so the delivery worker sends them when scheduled_for passes and
    stamps Guest.reminder_sent on success.
    """
    wedding = get_request_wedding(request)

    guest_ids = request.data.get('guest_ids', [])
    scheduled_for = request.data.get('scheduled_for')
    channel = request.data.get('channel', 'email')

    if not isinstance(guest_ids, list) or not guest_ids:
        return APIResponse.error(
            "guest_ids must be a non-empty list",
            ["Choose the guests to remind"],
            status.HTTP_400_BAD_REQUEST
        )
    if not scheduled_for:
        return APIResponse.error(
            "scheduled_for is required",
            ["Provide the datetime reminders should be sent at"],
            status.HTTP_400_BAD_REQUEST
        )
    if channel not in ('email', 'in_app'):
        return APIResponse.error(
            "channel must be 'email' or 'in_app'",
            ["Pick a supported delivery channel"],
            status.HTTP_400_BAD_REQUEST
        )

    from django.utils.dateparse import parse_datetime
    from django.utils import timezone

    parsed = parse_datetime(str(scheduled_for))
    if parsed is None:
        return APIResponse.error(
            "scheduled_for is not a valid datetime",
            ["Use ISO 8601, e.g. 2026-06-01T09:00:00Z"],
            status.HTTP_400_BAD_REQUEST
        )
    if timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed, timezone.get_current_timezone())

    guests = Guest.objects.filter(
        id__in=guest_ids, wedding=wedding, rsvp_status__name__iexact='pending'
    ).select_related('rsvp_status')

    from notifications.models import Reminder

    from django.contrib.contenttypes.models import ContentType

    guest_content_type = ContentType.objects.get_for_model(Guest)

    created = []
    for guest in guests:
        if channel == 'email' and not guest.email:
            continue
        reminder = Reminder.objects.create(
            wedding=wedding,
            kind='guest_rsvp',
            channel=channel,
            target_type=guest_content_type,
            target_id=guest.id,
            to_email=guest.email or '',
            subject='RSVP reminder',
            message=(
                f"Hi {guest.first_name}, a gentle reminder to RSVP for our "
                "wedding. We hope to see you there!"
            ),
            scheduled_for=parsed,
        )
        created.append(reminder.id)

    return APIResponse.success({
        'scheduled_count': len(created),
        'reminder_ids': created,
    }, f"Scheduled {len(created)} reminders successfully")


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def seating_auto_assign(request):
    """
    Auto-assign every unseated guest using the largest-group-first fill.

    Applies the table capacity and venue capacity guards, so the plan never
    overfills a table or the venue; guests that do not fit are reported
    back unassigned.
    """
    wedding = get_request_wedding(request)

    result = auto_assign_seats(wedding)

    return APIResponse.success(result, "Seating auto-assignment completed")
