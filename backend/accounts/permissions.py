"""
Role-Based Access Control (RBAC) permission classes for the wedding platform.
"""
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission class that allows only admin users."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role and request.user.role.name == 'admin'


class IsBride(permissions.BasePermission):
    """Permission class that allows only bride users."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role and request.user.role.name == 'bride'


class IsGroom(permissions.BasePermission):
    """Permission class that allows only groom users."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role and request.user.role.name == 'groom'


class IsGuardian(permissions.BasePermission):
    """Permission class that allows only guardian users."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role and request.user.role.name == 'guardian'


class IsBrideOrGroom(permissions.BasePermission):
    """Permission class that allows bride or groom users."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not request.user.role:
            return False
        return request.user.role.name in ['bride', 'groom']


class IsCoupleOrAdmin(permissions.BasePermission):
    """Permission class that allows bride, groom, or admin users."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not request.user.role:
            return False
        return request.user.role.name in ['bride', 'groom', 'admin']


class IsWeddingOwnerOrAdmin(permissions.BasePermission):
    """Permission class that allows wedding owners or admins."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not request.user.role:
            return False
        # Admin can access everything
        if request.user.role.name == 'admin':
            return True
        # Others need to be the wedding owner
        return True  # Will be checked at object level
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if not request.user.role:
            return False
        # Admin can access everything
        if request.user.role.name == 'admin':
            return True
        # Check if user owns the wedding
        if hasattr(obj, 'wedding'):
            return obj.wedding.user == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False