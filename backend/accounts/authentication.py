"""
Custom JWT authentication that supports HttpOnly cookie transport.

Tokens are read from the Authorization header first (for API clients), then
from the HttpOnly access-token cookie (for browser clients that cannot store
tokens in script-reachable storage).

Because cookies are attached automatically by the browser, an unsafe request
authenticated only by a cookie must prove it came from our own frontend: the
X-CSRFToken header must match the CSRF cookie.
"""

from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication


class CSRFCheck(CsrfViewMiddleware):
    """CsrfViewMiddleware variant that reports the failure reason instead of a response."""

    def _reject(self, request, reason):
        return reason


class SessionAwareJWTAuthentication(JWTAuthentication):
    """JWT authentication that reads either the header or the cookie."""

    def authenticate(self, request):
        result = super().authenticate(request)
        authenticated_by_header = result is not None

        if result is None:
            result = self._authenticate_via_cookie(request)

        if result is None:
            return None

        user, token = result
        request.auth_session_id = token.get('session_id')

        # Header-authenticated requests are CSRF-exempt: a cross-origin script
        # cannot set an Authorization header without a preflight we reject.
        if not authenticated_by_header:
            self._enforce_csrf(request)

        return user, token

    def _authenticate_via_cookie(self, request):
        raw_token = request.COOKIES.get(getattr(settings, 'AUTH_COOKIE_ACCESS', 'access_token'))
        if not raw_token:
            return None
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token

    @staticmethod
    def _enforce_csrf(request):
        if request.method in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            return

        # The access cookie alone is not proof of intent; unsafe methods also
        # require the matching CSRF token from our frontend.
        check = CSRFCheck(lambda request: None)
        check.process_request(request)
        reason = check.process_view(request, _dummy_view, (), {})
        if reason:
            raise exceptions.PermissionDenied(f'CSRF Failed: {reason}')


def _dummy_view(request):  # pragma: no cover - placeholder for CSRF inspection
    return None
