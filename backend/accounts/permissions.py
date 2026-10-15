"""
Role-Based Access Control (RBAC) permission classes for the wedding platform.
"""
from rest_framework import permissions


def _is_admin(user):
    """
    Return True when the user may administer shared reference data.

    Either the admin role or Django's is_superuser flag grants access, so a
    superuser created via the admin is not locked out by role configuration.
    """
    if not user or not user.is_authenticated:
        return False
    if getattr(user, 'is_superuser', False):
        return True
    return bool(user.role) and user.role.name == 'admin'


class IsAdmin(permissions.BasePermission):
    """Permission class that allows only admin users."""
    
    def has_permission(self, request, view):
        return _is_admin(request.user)


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow any authenticated user to read shared catalog/lookup data, but
    restrict create, update and delete to admins.

    Used for global, unowned reference tables (roles, statuses, categories)
    where a write by an ordinary user would let them tamper with shared
    state — e.g. creating roles or renaming statuses.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return _is_admin(request.user)


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
        # Read access is decided at object level, where ownership is known.
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        # Admin can access everything
        if _is_admin(request.user):
            return True
        # Check if user owns the wedding
        if hasattr(obj, 'wedding'):
            return obj.wedding.user == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
