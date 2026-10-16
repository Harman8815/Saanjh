"""
Standardized API response utilities for consistent API responses across the application.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from django.http import Http404 as DjangoHttp404
from rest_framework import status
from rest_framework.response import Response


def get_request_wedding(request, required=True):
    """
    Resolve the wedding owned by the requesting user.

    ``request.user.wedding`` raises ``User.wedding.RelatedObjectDoesNotExist``
    when no wedding exists, which would otherwise surface as a 500. This helper
    raises ``NotFoundError`` instead, giving a clean 404.

    ``required=False`` returns None so callers that tolerate a missing wedding
    (e.g. statistics returning zeroes) can proceed.
    """
    from django.core.exceptions import ObjectDoesNotExist

    try:
        return request.user.wedding
    except (ObjectDoesNotExist, DjangoHttp404, AttributeError):
        if required:
            # NotFoundError is defined later in this module.
            raise NotFoundError(
                resource="Wedding",
                message="No wedding found for this user. Please create a wedding first."
            )
        return None


class APIResponse:
    """Shared response helpers compatible with the project’s legacy and test contracts."""

    @staticmethod
    def _timestamp() -> str:
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def success(
        data: Any = None,
        message: str = "Operation successful",
        status_code: int = status.HTTP_200_OK,
    ) -> Response:
        payload = {
            "success": True,
            "data": data if data is not None else {},
            "message": message,
            "errors": [],
            "timestamp": APIResponse._timestamp(),
        }
        return Response(payload, status=status_code)

    @staticmethod
    def error(
        message: str,
        errors: Optional[List[str]] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        error_code: str = "ERROR",
        details: Optional[Dict[str, Any]] = None,
        data: Any = None,
    ) -> Response:
        response_data = {
            "success": False,
            "data": data if data is not None else {},
            "message": message,
            "errors": errors or [],
            "timestamp": APIResponse._timestamp(),
            "error": {
                "code": str(error_code).upper(),
                "message": message,
                "details": details or {},
            },
        }
        return Response(response_data, status=status_code)

    @staticmethod
    def created(data: Any = None, message: str = "Resource created successfully") -> Response:
        return APIResponse.success(data=data, message=message, status_code=status.HTTP_201_CREATED)

    @staticmethod
    def no_content(message: str = "Operation completed successfully") -> Response:
        payload = {
            "success": True,
            "data": {},
            "message": message,
            "errors": [],
            "timestamp": APIResponse._timestamp(),
        }
        return Response(payload, status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def not_found(resource: str = "Resource", message: Optional[str] = None) -> Response:
        error_message = message or f"{resource} not found"
        return APIResponse.error(
            message=error_message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
        )

    @staticmethod
    def forbidden(message: str = "Access denied") -> Response:
        return APIResponse.error(message=message, status_code=status.HTTP_403_FORBIDDEN, error_code="FORBIDDEN")

    @staticmethod
    def unauthorized(message: str = "Authentication required") -> Response:
        return APIResponse.error(message=message, status_code=status.HTTP_401_UNAUTHORIZED, error_code="UNAUTHORIZED")

    @staticmethod
    def validation_error(errors: Any, message: str = "Validation failed") -> Response:
        if isinstance(errors, dict):
            details = errors
            error_list = []
            for key, value in errors.items():
                if isinstance(value, (list, tuple)):
                    error_list.extend(str(item) for item in value)
                else:
                    error_list.append(str(value))
        elif isinstance(errors, (list, tuple)):
            details = {"non_field_errors": list(errors)}
            error_list = [str(item) for item in errors]
        else:
            details = {"non_field_errors": [str(errors)]}
            error_list = [str(errors)]
        return APIResponse.error(
            message=message,
            errors=error_list,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            details=details,
        )

    @staticmethod
    def server_error(
        message: str = "Internal server error",
        errors: Optional[List[str]] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> Response:
        return APIResponse.error(
            message=message,
            errors=errors or [],
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="SERVER_ERROR",
            details=details or {},
        )


class APIException(Exception):
    """Base exception class for API errors."""

    def __init__(
        self,
        message: str,
        errors: Optional[List[str]] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        error_code: str = "API_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.errors = errors or []
        self.status_code = status_code
        self.error_code = str(error_code).upper()
        self.details = details or {}
        super().__init__(message)


class ValidationError(APIException):
    """Exception for validation errors."""

    def __init__(self, errors: Any, message: str = "Validation failed"):
        details = errors if isinstance(errors, dict) else {"non_field_errors": errors if isinstance(errors, list) else [str(errors)]}
        super().__init__(
            message=message,
            errors=errors if isinstance(errors, list) else [str(errors)],
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            details=details,
        )


class NotFoundError(APIException):
    """Exception for resource not found errors."""

    def __init__(self, resource: str = "Resource", message: Optional[str] = None):
        error_message = message or f"{resource} not found"
        super().__init__(
            message=error_message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
            details={"resource": resource},
        )


class ForbiddenError(APIException):
    """Exception for access denied errors."""

    def __init__(self, message: str = "Access denied"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN",
            details={},
        )


class UnauthorizedError(APIException):
    """Exception for authentication errors."""

    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="UNAUTHORIZED",
            details={},
        )


class ConflictError(APIException):
    """Exception for resource conflict errors."""

    def __init__(self, message: str = "Resource conflict"):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            error_code="CONFLICT",
        )


class ServerError(APIException):
    """Exception for internal server errors."""

    def __init__(self, message: str = "Internal server error", errors: Optional[List[str]] = None):
        super().__init__(
            message=message,
            errors=errors or [],
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="SERVER_ERROR",
            details={},
        )
