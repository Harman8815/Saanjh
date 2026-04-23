"""
Standardized API response utilities for consistent API responses across the application.
"""

from rest_framework import status
from rest_framework.response import Response
from typing import Any, Dict, Optional, Union
from django.http import JsonResponse


class APIResponse:
    """
    Standardized API response class for consistent JSON responses.
    
    Response Format:
    {
        "success": true/false,
        "data": {...},  // Only if success is true
        "error": {
            "code": "ERROR_CODE",
            "message": "Human readable error message",
            "details": {...}  // Optional additional error details
        },  // Only if success is false
        "message": "Success message",  // Optional success message
        "timestamp": "2024-01-01T00:00:00Z"
    }
    """
    
    @staticmethod
    def success(
        data: Any = None,
        message: str = "Operation successful",
        status_code: int = status.HTTP_200_OK
    ) -> Response:
        """
        Create a successful API response.
        
        Args:
            data: The response data
            message: Success message
            status_code: HTTP status code
            
        Returns:
            Response: Standardized success response
        """
        response_data = {
            "success": True,
            "data": data,
            "message": message,
            "timestamp": "2024-01-01T00:00:00Z"  # TODO: Use actual timestamp
        }
        
        return Response(response_data, status=status_code)
    
    @staticmethod
    def error(
        error_code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST
    ) -> Response:
        """
        Create an error API response.
        
        Args:
            error_code: Machine-readable error code
            message: Human-readable error message
            details: Additional error details
            status_code: HTTP status code
            
        Returns:
            Response: Standardized error response
        """
        response_data = {
            "success": False,
            "error": {
                "code": error_code,
                "message": message,
                "details": details or {}
            },
            "timestamp": "2024-01-01T00:00:00Z"  # TODO: Use actual timestamp
        }
        
        return Response(response_data, status=status_code)
    
    @staticmethod
    def created(
        data: Any = None,
        message: str = "Resource created successfully"
    ) -> Response:
        """Helper for 201 Created responses."""
        return APIResponse.success(data, message, status.HTTP_201_CREATED)
    
    @staticmethod
    def no_content(
        message: str = "Operation completed successfully"
    ) -> Response:
        """Helper for 204 No Content responses."""
        response_data = {
            "success": True,
            "message": message,
            "timestamp": "2024-01-01T00:00:00Z"  # TODO: Use actual timestamp
        }
        return Response(response_data, status=status.HTTP_204_NO_CONTENT)
    
    @staticmethod
    def not_found(
        resource: str = "Resource",
        message: Optional[str] = None
    ) -> Response:
        """Helper for 404 Not Found responses."""
        error_message = message or f"{resource} not found"
        return APIResponse.error(
            error_code="NOT_FOUND",
            message=error_message,
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    @staticmethod
    def forbidden(
        message: str = "Access denied"
    ) -> Response:
        """Helper for 403 Forbidden responses."""
        return APIResponse.error(
            error_code="FORBIDDEN",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    @staticmethod
    def unauthorized(
        message: str = "Authentication required"
    ) -> Response:
        """Helper for 401 Unauthorized responses."""
        return APIResponse.error(
            error_code="UNAUTHORIZED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    
    @staticmethod
    def validation_error(
        errors: Dict[str, Any],
        message: str = "Validation failed"
    ) -> Response:
        """Helper for validation errors."""
        return APIResponse.error(
            error_code="VALIDATION_ERROR",
            message=message,
            details=errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    @staticmethod
    def server_error(
        message: str = "Internal server error",
        details: Optional[Dict[str, Any]] = None
    ) -> Response:
        """Helper for 500 Internal Server Error responses."""
        return APIResponse.error(
            error_code="SERVER_ERROR",
            message=message,
            details=details,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class APIException(Exception):
    """
    Base exception class for API errors.
    """
    
    def __init__(
        self,
        error_code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None
    ):
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class ValidationError(APIException):
    """Exception for validation errors."""
    
    def __init__(self, errors: Dict[str, Any], message: str = "Validation failed"):
        super().__init__(
            error_code="VALIDATION_ERROR",
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=errors
        )


class NotFoundError(APIException):
    """Exception for resource not found errors."""
    
    def __init__(self, resource: str = "Resource", message: Optional[str] = None):
        error_message = message or f"{resource} not found"
        super().__init__(
            error_code="NOT_FOUND",
            message=error_message,
            status_code=status.HTTP_404_NOT_FOUND
        )


class ForbiddenError(APIException):
    """Exception for access denied errors."""
    
    def __init__(self, message: str = "Access denied"):
        super().__init__(
            error_code="FORBIDDEN",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN
        )


class UnauthorizedError(APIException):
    """Exception for authentication errors."""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            error_code="UNAUTHORIZED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class ConflictError(APIException):
    """Exception for resource conflict errors."""
    
    def __init__(self, message: str = "Resource conflict"):
        super().__init__(
            error_code="CONFLICT",
            message=message,
            status_code=status.HTTP_409_CONFLICT
        )


class ServerError(APIException):
    """Exception for internal server errors."""
    
    def __init__(self, message: str = "Internal server error", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            error_code="SERVER_ERROR",
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details
        )
