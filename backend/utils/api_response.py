"""
Standardized API response utilities for consistent API responses across the application.
"""

from rest_framework import status
from rest_framework.response import Response
from typing import Any, Dict, Optional, Union, List
from django.http import JsonResponse


class APIResponse:
    """
    Standardized API response class for consistent JSON responses.
    
    Response Format:
    {
        "success": true | false,
        "data": {},
        "message": "optional",
        "errors": []
    }
    
    Rules:
    - success: required
    - data: always present (empty {} if none)
    - errors: empty list if no error
    """
    
    @staticmethod
    def success(
        data: Any = {},
        message: str = "Operation successful",
        status_code: int = status.HTTP_200_OK
    ) -> Response:
        """
        Create a successful API response.
        
        Args:
            data: The response data (defaults to empty dict)
            message: Success message
            status_code: HTTP status code
            
        Returns:
            Response: Standardized success response
        """
        response_data = {
            "success": True,
            "data": data or {},
            "message": message,
            "errors": []
        }
        
        return Response(response_data, status=status_code)
    
    @staticmethod
    def error(
        message: str,
        errors: List[str] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST
    ) -> Response:
        """
        Create an error API response.
        
        Args:
            message: Human-readable error message
            errors: List of error messages (defaults to empty list)
            status_code: HTTP status code
            
        Returns:
            Response: Standardized error response
        """
        response_data = {
            "success": False,
            "data": {},
            "message": message,
            "errors": errors or []
        }
        
        return Response(response_data, status=status_code)
    
    @staticmethod
    def created(
        data: Any = {},
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
            "data": {},
            "message": message,
            "errors": []
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
            message=error_message,
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    @staticmethod
    def forbidden(
        message: str = "Access denied"
    ) -> Response:
        """Helper for 403 Forbidden responses."""
        return APIResponse.error(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    @staticmethod
    def unauthorized(
        message: str = "Authentication required"
    ) -> Response:
        """Helper for 401 Unauthorized responses."""
        return APIResponse.error(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    
    @staticmethod
    def validation_error(
        errors: List[str],
        message: str = "Validation failed"
    ) -> Response:
        """Helper for validation errors."""
        return APIResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    @staticmethod
    def server_error(
        message: str = "Internal server error",
        errors: List[str] = None
    ) -> Response:
        """Helper for 500 Internal Server Error responses."""
        return APIResponse.error(
            message=message,
            errors=errors or [],
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class APIException(Exception):
    """
    Base exception class for API errors.
    """
    
    def __init__(
        self,
        message: str,
        errors: List[str] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST
    ):
        self.message = message
        self.errors = errors or []
        self.status_code = status_code
        super().__init__(message)


class ValidationError(APIException):
    """Exception for validation errors."""
    
    def __init__(self, errors: List[str], message: str = "Validation failed"):
        super().__init__(
            message=message,
            errors=errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class NotFoundError(APIException):
    """Exception for resource not found errors."""
    
    def __init__(self, resource: str = "Resource", message: Optional[str] = None):
        error_message = message or f"{resource} not found"
        super().__init__(
            message=error_message,
            status_code=status.HTTP_404_NOT_FOUND
        )


class ForbiddenError(APIException):
    """Exception for access denied errors."""
    
    def __init__(self, message: str = "Access denied"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN
        )


class UnauthorizedError(APIException):
    """Exception for authentication errors."""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class ConflictError(APIException):
    """Exception for resource conflict errors."""
    
    def __init__(self, message: str = "Resource conflict"):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT
        )


class ServerError(APIException):
    """Exception for internal server errors."""
    
    def __init__(self, message: str = "Internal server error", errors: List[str] = None):
        super().__init__(
            message=message,
            errors=errors or [],
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
