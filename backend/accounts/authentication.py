"""
Custom JWT authentication that is aware of tracked user sessions.

Extends SimpleJWT's authentication to expose the ``session_id`` claim on the
request, allowing views to identify which session (device) a call comes from.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication


class SessionAwareJWTAuthentication(JWTAuthentication):
    """JWT authentication that attaches the token's session id to the request."""

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None

        user, token = result
        request.auth_session_id = token.get('session_id')
        return user, token
