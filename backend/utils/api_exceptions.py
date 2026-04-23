"""
API exception handling decorators and utilities.
"""

import logging
from functools import wraps
from typing import Any, Callable
from django.http import HttpRequest, HttpResponse
from rest_framework.response import Response
from rest_framework import status
from .api_response import APIResponse, APIException

logger = logging.getLogger(__name__)


def handle_api_exceptions(view_func: Callable) -> Callable:
    """
    Decorator to handle API exceptions and convert them to standardized responses.
    
    This decorator catches APIException and its subclasses, converts them to
    standardized API responses, and logs the error.
    
    Usage:
        @handle_api_exceptions
        def my_api_view(request):
            # Your view logic here
            pass
    """
    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs) -> HttpResponse:
        try:
            return view_func(request, *args, **kwargs)
        except APIException as e:
            # Log the error for debugging
            logger.error(
                f"API Exception in {view_func.__name__}: {e.error_code} - {e.message}",
                extra={
                    'error_code': e.error_code,
                    'message': e.message,
                    'status_code': e.status_code,
                    'details': e.details,
                    'path': request.path,
                    'method': request.method,
                    'user': getattr(request.user, 'id', None) if hasattr(request, 'user') else None
                }
            )
            
            # Return standardized error response
            return APIResponse.error(
                error_code=e.error_code,
                message=e.message,
                details=e.details,
                status_code=e.status_code
            )
        except Exception as e:
            # Handle unexpected exceptions
            logger.error(
                f"Unexpected error in {view_func.__name__}: {str(e)}",
                extra={
                    'error_type': type(e).__name__,
                    'error_message': str(e),
                    'path': request.path,
                    'method': request.method,
                    'user': getattr(request.user, 'id', None) if hasattr(request, 'user') else None
                },
                exc_info=True
            )
            
            # Return generic server error response
            return APIResponse.server_error(
                message="An unexpected error occurred",
                details={'error_type': type(e).__name__}
            )
    
    return wrapper


def validate_request(serializer_class=None, require_auth: bool = True):
    """
    Decorator for common request validation and authentication checks.
    
    Args:
        serializer_class: DRF serializer class for request validation
        require_auth: Whether authentication is required
    
    Usage:
        @validate_request(MySerializer, require_auth=True)
        def my_api_view(request):
            # Request is validated and authenticated
            pass
    """
    def decorator(view_func: Callable) -> Callable:
        @wraps(view_func)
        @handle_api_exceptions
        def wrapper(request: HttpRequest, *args, **kwargs) -> HttpResponse:
            # Check authentication if required
            if require_auth and not hasattr(request, 'user'):
                return APIResponse.unauthorized("Authentication required")
            
            if require_auth and not request.user.is_authenticated:
                return APIResponse.unauthorized("Authentication required")
            
            # Validate request data if serializer is provided
            if serializer_class and request.method in ['POST', 'PUT', 'PATCH']:
                try:
                    serializer = serializer_class(data=request.data)
                    if not serializer.is_valid():
                        return APIResponse.validation_error(
                            errors=serializer.errors,
                            message="Request validation failed"
                        )
                    
                    # Add validated data to request for use in view
                    request.validated_data = serializer.validated_data
                    
                except Exception as e:
                    logger.error(f"Serializer error in {view_func.__name__}: {str(e)}")
                    return APIResponse.validation_error(
                        errors={'non_field_errors': ['Invalid request format']},
                        message="Request format is invalid"
                    )
            
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def log_api_calls(view_func: Callable) -> Callable:
    """
    Decorator to log API calls for monitoring and debugging.
    """
    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs) -> HttpResponse:
        # Log incoming request
        logger.info(
            f"API Call: {request.method} {request.path}",
            extra={
                'method': request.method,
                'path': request.path,
                'user_id': getattr(request.user, 'id', None) if hasattr(request, 'user') else None,
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'ip_address': get_client_ip(request)
            }
        )
        
        # Execute view
        response = view_func(request, *args, **kwargs)
        
        # Log response status
        logger.info(
            f"API Response: {request.method} {request.path} - {response.status_code}",
            extra={
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'user_id': getattr(request.user, 'id', None) if hasattr(request, 'user') else None
            }
        )
        
        return response
    
    return wrapper


def get_client_ip(request: HttpRequest) -> str:
    """Helper function to get client IP address."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip or 'unknown'


class APIErrorHandler:
    """
    Utility class for handling common API error scenarios.
    """
    
    @staticmethod
    def handle_object_not_found(model_class, object_id: Any, field_name: str = 'id'):
        """
        Handle object not found scenarios with proper error response.
        
        Args:
            model_class: Django model class
            object_id: ID of the object to find
            field_name: Field name to search by
            
        Raises:
            NotFoundError: If object is not found
        """
        try:
            filter_kwargs = {field_name: object_id}
            obj = model_class.objects.get(**filter_kwargs)
            return obj
        except model_class.DoesNotExist:
            model_name = model_class.__name__.replace('Model', '')
            raise NotFoundError(
                resource=model_name,
                message=f"{model_name} with {field_name} '{object_id}' not found"
            )
        except model_class.MultipleObjectsReturned:
            model_name = model_class.__name__.replace('Model', '')
            raise ServerError(
                message=f"Multiple {model_name.lower()} objects found with {field_name} '{object_id}'",
                details={'field': field_name, 'value': object_id}
            )
    
    @staticmethod
    def handle_permission_check(user, permission: str, resource: str = "resource"):
        """
        Handle permission checks with proper error response.
        
        Args:
            user: Django user object
            permission: Permission string to check
            resource: Resource name for error message
            
        Raises:
            ForbiddenError: If user doesn't have permission
        """
        if not user.has_perm(permission):
            raise ForbiddenError(
                message=f"You don't have permission to {permission.replace('_', ' ')} this {resource}"
            )
    
    @staticmethod
    def handle_ownership_check(obj, user, resource_name: str = "resource"):
        """
        Handle object ownership checks with proper error response.
        
        Args:
            obj: Django model instance
            user: Django user object
            resource_name: Resource name for error message
            
        Raises:
            ForbiddenError: If user doesn't own the object
        """
        if hasattr(obj, 'user') and obj.user != user:
            raise ForbiddenError(
                message=f"You don't have permission to access this {resource_name}"
            )
        
        # Handle wedding-specific ownership
        if hasattr(obj, 'wedding') and hasattr(obj.wedding, 'user') and obj.wedding.user != user:
            raise ForbiddenError(
                message=f"You don't have permission to access this {resource_name}"
            )
