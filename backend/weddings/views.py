from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from django.shortcuts import get_object_or_404
from .models import (
    Wedding, WeddingStatus, Venue, VenueCatalog, 
    VenueAmenity, VenueAmenityMap
)
from .serializers import (
    WeddingSerializer, WeddingCreateSerializer, WeddingUpdateSerializer,
    WeddingStatusSerializer, VenueSerializer, VenueCatalogSerializer,
    VenueCatalogCreateSerializer, VenueAmenitySerializer
)
from utils.api_response import APIResponse, APIException, NotFoundError, ValidationError, ForbiddenError
from utils.api_exceptions import handle_api_exceptions, log_api_calls, APIErrorHandler

class WeddingStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for WeddingStatus model"""
    queryset = WeddingStatus.objects.all()
    serializer_class = WeddingStatusSerializer
    permission_classes = [permissions.IsAuthenticated]


class VenueAmenityViewSet(viewsets.ModelViewSet):
    """ViewSet for VenueAmenity model"""
    queryset = VenueAmenity.objects.all()
    serializer_class = VenueAmenitySerializer
    permission_classes = [permissions.IsAuthenticated]


class VenueCatalogViewSet(viewsets.ModelViewSet):
    """ViewSet for VenueCatalog model"""
    queryset = VenueCatalog.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VenueCatalogCreateSerializer
        return VenueCatalogSerializer


class VenueViewSet(viewsets.ModelViewSet):
    """ViewSet for Venue model"""
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [permissions.IsAuthenticated]


class WeddingViewSet(viewsets.ModelViewSet):
    """ViewSet for Wedding model with standardized responses"""
    serializer_class = WeddingSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Wedding.objects.all()  # Required for DRF router basename
    
    def get_queryset(self):
        return Wedding.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WeddingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return WeddingUpdateSerializer
        return WeddingSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """List weddings with standardized response"""
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return APIResponse.success(
                data=serializer.data,
                message="Weddings retrieved successfully"
            )
        except Exception as e:
            raise APIException(
                error_code="WEDDING_LIST_ERROR",
                message="Failed to retrieve weddings",
                details={'original_error': str(e)}
            )
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve single wedding with standardized response"""
        try:
            instance = self.get_object()
            # Check ownership
            APIErrorHandler.handle_ownership_check(instance, request.user, "wedding")
            serializer = self.get_serializer(instance)
            return APIResponse.success(
                data=serializer.data,
                message="Wedding retrieved successfully"
            )
        except Wedding.DoesNotExist:
            raise NotFoundError(resource="Wedding")
        except APIException:
            raise
        except Exception as e:
            raise APIException(
                error_code="WEDDING_RETRIEVE_ERROR",
                message="Failed to retrieve wedding",
                details={'original_error': str(e)}
            )
    
    def create(self, request, *args, **kwargs):
        """Create wedding with standardized response"""
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(
                    errors=serializer.errors,
                    message="Wedding creation validation failed"
                )
            self.perform_create(serializer)
            return APIResponse.created(
                data=serializer.data,
                message="Wedding created successfully"
            )
        except APIException:
            raise
        except Exception as e:
            raise APIException(
                error_code="WEDDING_CREATE_ERROR",
                message="Failed to create wedding",
                details={'original_error': str(e)}
            )
    
    def update(self, request, *args, **kwargs):
        """Update wedding with standardized response"""
        try:
            instance = self.get_object()
            APIErrorHandler.handle_ownership_check(instance, request.user, "wedding")
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            if not serializer.is_valid():
                raise ValidationError(
                    errors=serializer.errors,
                    message="Wedding update validation failed"
                )
            self.perform_update(serializer)
            return APIResponse.success(
                data=serializer.data,
                message="Wedding updated successfully"
            )
        except Wedding.DoesNotExist:
            raise NotFoundError(resource="Wedding")
        except APIException:
            raise
        except Exception as e:
            raise APIException(
                error_code="WEDDING_UPDATE_ERROR",
                message="Failed to update wedding",
                details={'original_error': str(e)}
            )
    
    def destroy(self, request, *args, **kwargs):
        """Delete wedding with standardized response"""
        try:
            instance = self.get_object()
            APIErrorHandler.handle_ownership_check(instance, request.user, "wedding")
            self.perform_destroy(instance)
            return APIResponse.no_content(
                message="Wedding deleted successfully"
            )
        except Wedding.DoesNotExist:
            raise NotFoundError(resource="Wedding")
        except APIException:
            raise
        except Exception as e:
            raise APIException(
                error_code="WEDDING_DELETE_ERROR",
                message="Failed to delete wedding",
                details={'original_error': str(e)}
            )
    
    @action(detail=False, methods=['get'])
    def my_wedding(self, request):
        """Get current user's wedding with standardized response"""
        try:
            wedding, created = Wedding.objects.get_or_create(user=request.user)
            serializer = self.get_serializer(wedding)
            message = "Wedding retrieved successfully" if not created else "Wedding created successfully"
            return APIResponse.success(
                data=serializer.data,
                message=message
            )
        except Exception as e:
            raise APIException(
                error_code="MY_WEDDING_ERROR",
                message="Failed to retrieve/create wedding",
                details={'original_error': str(e)}
            )


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
@handle_api_exceptions
@log_api_calls
def wedding_dashboard(request):
    """Get wedding dashboard data"""
    try:
        # Get user's wedding or raise NotFoundError
        try:
            wedding = request.user.wedding
        except Wedding.DoesNotExist:
            raise NotFoundError(
                resource="Wedding",
                message="No wedding found for this user. Please create a wedding first."
            )
        
        # Check if user has permission to access this wedding
        APIErrorHandler.handle_ownership_check(wedding, request.user, "wedding")
        
        # Get guest statistics
        guests = wedding.guests.all()
        guest_stats = {
            'total': guests.count(),
            'confirmed': guests.filter(rsvp_status__name='confirmed').count(),
            'pending': guests.filter(rsvp_status__name='pending').count(),
            'declined': guests.filter(rsvp_status__name='declined').count(),
        }
        
        # Get vendor statistics
        vendors = wedding.vendors.all()
        vendor_stats = {
            'total': vendors.count(),
            'confirmed': vendors.filter(status__name='confirmed').count(),
            'pending': vendors.filter(status__name='pending').count(),
            'contacted': vendors.filter(status__name='contacted').count(),
        }
        
        # Get expense statistics
        expenses = wedding.expenses.all()
        total_expenses = sum(expense.amount for expense in expenses)
        total_paid = sum(expense.paid_amount for expense in expenses)
        
        expense_stats = {
            'total_estimated': float(total_expenses),
            'total_actual': float(total_expenses),
            'total_paid': float(total_paid),
            'remaining': float(total_expenses - total_paid),
            'budget_used': 0,  # Placeholder - budget field not available in Wedding model
        }
        
        # Get recent activities
        recent_guests = guests.order_by('-added_date')[:5]
        recent_expenses = expenses.order_by('-created_at')[:5]
        recent_vendors = vendors.order_by('-id')[:5]  # Vendor model doesn't have updated_at field
        
        # Prepare dashboard data
        dashboard_data = {
            'wedding': WeddingSerializer(wedding).data,
            'guest_stats': guest_stats,
            'vendor_stats': vendor_stats,
            'expense_stats': expense_stats,
            'recent_activities': {
                'guests': [
                    {
                        'name': f"{g.first_name} {g.last_name}".strip(),
                        'date': g.added_date.isoformat() if g.added_date else None,
                        'type': 'guest_added'
                    } for g in recent_guests
                ],
                'expenses': [
                    {
                        'description': e.title,
                        'date': e.created_at.isoformat() if e.created_at else None,
                        'type': 'expense_logged'
                    } for e in recent_expenses
                ],
                'vendors': [
                    {
                        'name': v.vendor_catalog.name if v.vendor_catalog else 'Unknown',
                        'date': None,
                        'type': 'vendor_updated'
                    } for v in recent_vendors
                ],
            },
        }
        
        return APIResponse.success(
            data=dashboard_data,
            message="Dashboard data retrieved successfully"
        )
        
    except APIException:
        # Re-raise API exceptions to be handled by decorator
        raise
    except Exception as e:
        # Handle unexpected errors
        raise APIException(
            error_code="DASHBOARD_ERROR",
            message="Failed to retrieve dashboard data",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={'original_error': str(e)}
        )

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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@handle_api_exceptions
@log_api_calls
def venue_search(request):
    """Search venues by capacity and type with standardized response"""
    try:
        # Get and validate query parameters
        try:
            capacity_min = int(request.GET.get('capacity_min', 0))
            capacity_max = int(request.GET.get('capacity_max', 1000))
            venue_type = request.GET.get('type', None)
        except ValueError as e:
            raise ValidationError(
                errors={'capacity': 'Invalid capacity values provided'},
                message='Invalid search parameters'
            )
        
        # Validate capacity range
        if capacity_min < 0 or capacity_max < 0 or capacity_min > capacity_max:
            raise ValidationError(
                errors={'capacity': 'Invalid capacity range'},
                message='Capacity minimum must be less than or equal to maximum'
            )
        
        # Query venues
        venues = VenueCatalog.objects.filter(
            capacity_min__lte=capacity_max,
            capacity_max__gte=capacity_min
        )
        
        if venue_type:
            venues = venues.filter(type=venue_type)
        
        # Serialize and return
        serializer = VenueCatalogSerializer(venues, many=True)
        return APIResponse.success(
            data={
                'venues': serializer.data,
                'filters': {
                    'capacity_min': capacity_min,
                    'capacity_max': capacity_max,
                    'type': venue_type
                },
                'count': len(serializer.data)
            },
            message=f"Found {len(serializer.data)} venues matching your criteria"
        )
        
    except APIException:
        raise
    except Exception as e:
        raise APIException(
            error_code="VENUE_SEARCH_ERROR",
            message="Failed to search venues",
            details={'original_error': str(e)}
        )
