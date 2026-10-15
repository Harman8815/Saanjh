"""
JWT token and session management services.

Centralises access/refresh token issuance, refresh-token blacklisting on
logout, and enforcement of the concurrent session limit.
"""

import logging

from django.conf import settings
from django.utils import timezone
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import UserSession

logger = logging.getLogger(__name__)


def _max_sessions():
    return getattr(settings, 'MAX_CONCURRENT_SESSIONS', 3)


def _client_ip(request):
    if request is None:
        return None
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def _device_name(request):
    """Derive a readable device label from the request user agent."""
    if request is None:
        return ''
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    if not user_agent:
        return ''
    # First parenthesised group in a typical UA string, e.g. "Windows NT 10.0".
    if '(' in user_agent and ')' in user_agent:
        inner = user_agent.split('(', 1)[1].split(')', 1)[0].strip()
        if inner:
            return inner[:255]
    return user_agent[:255]


def create_session(user, request=None):
    """
    Issue a JWT access/refresh pair and register a session for it.

    Returns a dict with the token payload plus the created UserSession.
    """
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    session = UserSession.objects.create(
        user=user,
        refresh_jti=refresh['jti'],
        device_name=_device_name(request),
        ip_address=_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '') if request else '',
    )

    # Bind the access token to this session so views can tell which device
    # a request comes from (see SessionAwareJWTAuthentication).
    access['session_id'] = str(session.id)

    return {
        'access': str(access),
        'access_expires_in': int(access['exp'] - access['iat']),
        'refresh': str(refresh),
        'session': session,
    }


def enforce_session_limit(user, limit=None):
    """
    Revoke the oldest active sessions until the user is under the limit.

    Each revoked session has its refresh token blacklisted, so the evicted
    device loses access on its next refresh attempt.

    Should be called after creating the new session, treating ``limit`` as
    the maximum number of sessions to retain.
    """
    limit = _max_sessions() if limit is None else limit
    active = list(
        UserSession.objects.filter(user=user, is_active=True).order_by('-created_at')
    )
    evicted = []
    while len(active) > limit:
        oldest = active.pop()
        oldest.revoke()
        evicted.append(oldest)
    return evicted


def find_session(refresh_token):
    """Return the active UserSession matching a refresh token string."""
    if not refresh_token:
        return None
    try:
        token = RefreshToken(refresh_token)
    except TokenError:
        return None
    return UserSession.objects.filter(refresh_jti=token.get('jti'), is_active=True).first()


def revoke_session(session):
    """Revoke one session, blacklisting its refresh token."""
    if session is None:
        return False
    session.revoke()
    return True


def revoke_all_sessions(user, except_session=None):
    """Revoke every active session for a user, optionally skipping one."""
    sessions = UserSession.objects.filter(user=user, is_active=True)
    if except_session is not None:
        sessions = sessions.exclude(pk=except_session.pk)
    count = 0
    for session in sessions:
        session.revoke()
        count += 1
    return count


def rotate_session(refresh_token):
    """
    Rotate a refresh token and return the new token payload.

    The presented refresh token is blacklisted first (so it can never be
    replayed), then a fresh jti/expiry is issued for the replacement.
    """
    refresh = RefreshToken(refresh_token)
    session = find_session(refresh_token)

    # Server-side invalidation of the consumed token.
    try:
        refresh.blacklist()
    except AttributeError:
        # Blacklist app not installed.
        pass

    # Issue replacement credentials with a new identity.
    refresh.set_jti()
    refresh.set_exp()
    refresh.set_iat()

    if session is not None:
        # Re-point the existing session at the rotated token.
        session.refresh_jti = refresh['jti']
        session.last_used_at = timezone.now()
        session.save(update_fields=['refresh_jti', 'last_used_at'])
        # Claims are copied to the new access token, keeping it session-bound.
        refresh['session_id'] = str(session.id)

    return {
        'access': str(refresh.access_token),
        'access_expires_in': int(refresh.access_token['exp'] - refresh.access_token['iat']),
        'refresh': str(refresh),
        'session': session,
    }
