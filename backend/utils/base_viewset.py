"""
Base ViewSet class for standardized API responses across all modules.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db.models import Model
from .api_response import APIResponse, APIException, NotFoundError, ValidationError, ForbiddenError
from .api_exceptions import handle_api_exceptions, log_api_calls, APIErrorHandler


class BaseViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet with standardized API responses and error handling.
    
    This class provides common CRUD operations with consistent response format
    and error handling that can be inherited by all other ViewSets.
    
    Features:
    - Standardized success/error responses
    - Automatic ownership checking
    - Proper exception handling
    - Request logging
    - Validation error handling
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Override this method in subclasses to implement proper filtering.
        Default implementation gets all objects for the current user.
        """
        model = self.queryset.model
        if hasattr(model, 'user'):
            return self.queryset.filter(user=self.request.user)
        elif hasattr(model, 'wedding') and hasattr(model.wedding.field.model, 'user'):
            return self.queryset.filter(wedding__user=self.request.user)
        return self.queryset
    
    def check_ownership(self, obj):
        """
        Check if the current user has permission to access the object.
        Override this method in subclasses for custom ownership logic.
        """
        APIErrorHandler.handle_ownership_check(obj, self.request.user, self.queryset.model.__name__)
    
    def list(self, request, *args, **kwargs):
        """List objects with standardized response."""
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return APIResponse.success(
                    data=self.get_paginated_response(serializer.data).data,
                    message=f"{self.queryset.model.__name__} list retrieved successfully"
                )
            
            serializer = self.get_serializer(queryset, many=True)
            return APIResponse.success(
                data=serializer.data,
                message=f"{self.queryset.model.__name__} list retrieved successfully"
            )
        except Exception as e:
            raise APIException(
                error_code=f"{self.queryset.model.__name__.upper()}_LIST_ERROR",
                message=f"Failed to retrieve {self.queryset.model.__name__.lower()} list",
                details={'original_error': str(e)}
            )
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve single object with standardized response."""
        try:
            instance = self.get_object()
            self.check_ownership(instance)
            serializer = self.get_serializer(instance)
            return APIResponse.success(
                data=serializer.data,
                message=f"{self.queryset.model.__name__} retrieved successfully"
            )
        except self.queryset.model.DoesNotExist:
            raise NotFoundError(resource=self.queryset.model.__name__)
        except APIException:
            raise
        except Exception as e:
            raise APIException(
                error_code=f"{self.queryset.model.__name__.upper()}_RETRIEVE_ERROR",
                message=f"Failed to retrieve {self.queryset.model.__name__.lower()}",
                details={'original_error': str(e)}
            )
    
    def create(self, request, *args, **kwargs):
        """Create object with standardized response."""
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(
                    errors=serializer.errors,
                    message=f"{self.queryset.model.__name__} creation validation failed"
                )
            self.perform_create(serializer)
            return APIResponse.created(
                data=serializer.data,
                message=f"{self.queryset.model.__name__} created successfully"
            )
        except APIException:
            raise
        except Exception as e:
            raise APIException(
                error_code=f"{self.queryset.model.__name__.upper()}_CREATE_ERROR",
                message=f"Failed to create {self.queryset.model.__name__.lower()}",
                details={'original_error': str(e)}
            )
    
    def update(self, request, *args, **kwargs):
        """Update object with standardized response."""
        try:
            instance = self.get_object()
            self.check_ownership(instance)
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            if not serializer.is_valid():
                raise ValidationError(
                    errors=serializer.errors,
                    message=f"{self.queryset.model.__name__} update validation failed"
                )
            self.perform_update(serializer)
            return APIResponse.success(
                data=serializer.data,
                message=f"{self.queryset.model.__name__} updated successfully"
            )
        except self.queryset.model.DoesNotExist:
            raise NotFoundError(resource=self.queryset.model.__name__)
        except APIException:
            raise
        except Exception as e:
            raise APIException(
                error_code=f"{self.queryset.model.__name__.upper()}_UPDATE_ERROR",
                message=f"Failed to update {self.queryset.model.__name__.lower()}",
                details={'original_error': str(e)}
            )
    
    def partial_update(self, request, *args, **kwargs):
        """Partial update with standardized response."""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete object with standardized response."""
        try:
            instance = self.get_object()
            self.check_ownership(instance)
            self.perform_destroy(instance)
            return APIResponse.no_content(
                message=f"{self.queryset.model.__name__} deleted successfully"
            )
        except self.queryset.model.DoesNotExist:
            raise NotFoundError(resource=self.queryset.model.__name__)
        except APIException:
            raise
        except Exception as e:
            raise APIException(
                error_code=f"{self.queryset.model.__name__.upper()}_DELETE_ERROR",
                message=f"Failed to delete {self.queryset.model.__name__.lower()}",
                details={'original_error': str(e)}
            )


class WeddingBaseViewSet(BaseViewSet):
    """
    Base ViewSet for wedding-related models.
    Automatically filters by user's wedding and handles wedding ownership.
    """
    
    def get_queryset(self):
        """Filter by current user's wedding."""
        try:
            wedding = self.request.user.wedding
            return self.queryset.filter(wedding=wedding)
        except Exception:
            # If user has no wedding, return empty queryset
            return self.queryset.none()
    
    def check_ownership(self, obj):
        """Check wedding ownership."""
        if hasattr(obj, 'wedding'):
            APIErrorHandler.handle_ownership_check(obj.wedding, self.request.user, "wedding")
        else:
            super().check_ownership(obj)
    
    def perform_create(self, serializer):
        """Automatically set wedding for new objects."""
        try:
            wedding = self.request.user.wedding
            serializer.save(wedding=wedding)
        except Exception as e:
            raise APIException(
                error_code="NO_WEDDING_FOUND",
                message="No wedding found for this user",
                details={'original_error': str(e)}
            )


class APIErrorCodes:
    """
    Centralized error codes for consistent error handling across APIs.
    """
    
    # Authentication errors
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    INVALID_TOKEN = "INVALID_TOKEN"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    
    # Validation errors
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD"
    INVALID_FORMAT = "INVALID_FORMAT"
    
    # Resource errors
    NOT_FOUND = "NOT_FOUND"
    ALREADY_EXISTS = "ALREADY_EXISTS"
    CONFLICT = "CONFLICT"
    
    # Server errors
    SERVER_ERROR = "SERVER_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"
    
    # Business logic errors
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"
    RESOURCE_LIMIT_EXCEEDED = "RESOURCE_LIMIT_EXCEEDED"
    INVALID_OPERATION = "INVALID_OPERATION"
    BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION"
    
    # Wedding-specific errors
    NO_WEDDING_FOUND = "NO_WEDDING_FOUND"
    WEDDING_ALREADY_EXISTS = "WEDDING_ALREADY_EXISTS"
    INVALID_WEDDING_DATE = "INVALID_WEDDING_DATE"
    WEDDING_DATE_IN_PAST = "WEDDING_DATE_IN_PAST"
    
    # Guest-specific errors
    GUEST_LIMIT_EXCEEDED = "GUEST_LIMIT_EXCEEDED"
    GUEST_ALREADY_EXISTS = "GUEST_ALREADY_EXISTS"
    INVALID_RSVP_STATUS = "INVALID_RSVP_STATUS"
    
    # Vendor-specific errors
    VENDOR_ALREADY_BOOKED = "VENDOR_ALREADY_BOOKED"
    VENDOR_UNAVAILABLE = "VENDOR_UNAVAILABLE"
    INVALID_VENDOR_STATUS = "INVALID_VENDOR_STATUS"
    
    # Expense-specific errors
    INSUFFICIENT_BUDGET = "INSUFFICIENT_BUDGET"
    INVALID_AMOUNT = "INVALID_AMOUNT"
    EXPENSE_ALREADY_PAID = "EXPENSE_ALREADY_PAID"
