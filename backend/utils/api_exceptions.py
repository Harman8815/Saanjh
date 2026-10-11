"""
API exception handling decorators and utilities.
"""

import logging
from functools import wraps
from typing import Any, Callable

from django.http import HttpRequest, HttpResponse
from rest_framework import exceptions as drf_exceptions
from rest_framework.views import exception_handler as drf_exception_handler

from .api_response import APIException, APIResponse

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Convert DRF exceptions into the project’s standardized API format."""
    if isinstance(exc, APIException):
        return APIResponse.error(
            message=exc.message,
            errors=exc.errors,
            status_code=exc.status_code,
            error_code=exc.error_code,
            details=exc.details,
        )

    response = drf_exception_handler(exc, context)
    if response is not None:
        data = response.data if isinstance(response.data, dict) else {"detail": response.data}
        status_code = response.status_code
        if isinstance(exc, (drf_exceptions.NotAuthenticated, drf_exceptions.AuthenticationFailed)):
            message = 'Authentication required' if isinstance(exc, drf_exceptions.NotAuthenticated) else str(data.get('detail', 'Authentication required'))
            code = 'UNAUTHORIZED'
            details = data
        elif isinstance(exc, drf_exceptions.PermissionDenied):
            message = str(data.get('detail', 'Access denied'))
            code = 'FORBIDDEN'
            details = data
        elif isinstance(exc, drf_exceptions.NotFound):
            message = str(data.get('detail', 'Resource not found'))
            code = 'NOT_FOUND'
            details = data
        elif isinstance(exc, drf_exceptions.ValidationError):
            message = "Validation failed"
            code = "VALIDATION_ERROR"
            details = data
        else:
            message = str(exc)
            code = "ERROR"
            details = data
        return APIResponse.error(
            message=message,
            status_code=status_code,
            error_code=code,
            details=details,
        )
    logger.error(
        "Unhandled API exception: %s",
        exc,
        exc_info=(type(exc), exc, exc.__traceback__),
    )
    return APIResponse.server_error(message="An unexpected error occurred")


def handle_api_exceptions(view_func: Callable) -> Callable:
    """Decorator to convert APIException and unexpected errors to standardized responses."""

    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs) -> HttpResponse:
        try:
            return view_func(request, *args, **kwargs)
        except APIException as e:
            logger.error(
                f"API Exception in {view_func.__name__}: {e.error_code} - {e.message}",
                extra={
                    'error_code': e.error_code,
                    'message': e.message,
                    'status_code': e.status_code,
                    'details': e.details,
                    'path': request.path,
                    'method': request.method,
                },
            )
            return APIResponse.error(
                message=e.message,
                errors=e.errors,
                status_code=e.status_code,
                error_code=e.error_code,
                details=e.details,
            )
        except Exception as e:
            logger.error(
                f"Unexpected error in {view_func.__name__}: {str(e)}",
                extra={
                    'error_type': type(e).__name__,
                    'error_message': str(e),
                    'path': request.path,
                    'method': request.method,
                },
                exc_info=True,
            )
            return APIResponse.server_error(message="An unexpected error occurred", details={'error_type': type(e).__name__})

    return wrapper


def validate_request(serializer_class=None, require_auth: bool = True):
    """Decorator for common request validation and authentication checks."""

    def decorator(view_func: Callable) -> Callable:
        @wraps(view_func)
        @handle_api_exceptions
        def wrapper(request: HttpRequest, *args, **kwargs) -> HttpResponse:
            if require_auth and not hasattr(request, 'user'):
                return APIResponse.unauthorized("Authentication required")
            if require_auth and not request.user.is_authenticated:
                return APIResponse.unauthorized("Authentication required")
            if serializer_class and request.method in ['POST', 'PUT', 'PATCH']:
                try:
                    serializer = serializer_class(data=request.data)
                    if not serializer.is_valid():
                        return APIResponse.validation_error(errors=serializer.errors, message="Request validation failed")
                    request.validated_data = serializer.validated_data
                except Exception:
                    return APIResponse.validation_error(
                        errors={'non_field_errors': ['Invalid request format']},
                        message="Request format is invalid",
                    )
            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator


def log_api_calls(view_func: Callable) -> Callable:
    """Decorator to log API calls for monitoring and debugging."""

    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs) -> HttpResponse:
        logger.info(
            f"API Call: {request.method} {request.path}",
            extra={
                'method': request.method,
                'path': request.path,
                'user_id': getattr(request.user, 'id', None) if hasattr(request, 'user') else None,
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'ip_address': get_client_ip(request),
            },
        )
        response = view_func(request, *args, **kwargs)
        logger.info(
            f"API Response: {request.method} {request.path} - {response.status_code}",
            extra={
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'user_id': getattr(request.user, 'id', None) if hasattr(request, 'user') else None,
            },
        )
        return response

    return wrapper


def get_client_ip(request: HttpRequest) -> str:
    """Helper function to get client IP address."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR') or 'unknown'


class APIErrorHandler:
    """Utility class for handling common API error scenarios."""

    @staticmethod
    def handle_object_not_found(model_class, object_id: Any, field_name: str = 'id'):
        try:
            filter_kwargs = {field_name: object_id}
            return model_class.objects.get(**filter_kwargs)
        except model_class.DoesNotExist:
            model_name = model_class.__name__.replace('Model', '')
            raise APIException(
                message=f"{model_name} with {field_name} '{object_id}' not found",
                status_code=404,
                error_code="NOT_FOUND",
                details={'field': field_name, 'value': object_id},
            )

    @staticmethod
    def handle_permission_check(user, permission: str, resource: str = "resource"):
        if not user.has_perm(permission):
            raise APIException(
                message=f"You don't have permission to {permission.replace('_', ' ')} this {resource}",
                status_code=403,
                error_code="FORBIDDEN",
            )

    @staticmethod
    def handle_ownership_check(obj, user, resource_name: str = "resource"):
        if hasattr(obj, 'user') and obj.user != user:
            raise APIException(
                message=f"You don't have permission to access this {resource_name}",
                status_code=403,
                error_code="FORBIDDEN",
            )
        if hasattr(obj, 'wedding') and hasattr(obj.wedding, 'user') and obj.wedding.user != user:
            raise APIException(
                message=f"You don't have permission to access this {resource_name}",
                status_code=403,
                error_code="FORBIDDEN",
            )

