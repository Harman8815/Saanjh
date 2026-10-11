"""
HttpOnly cookie transport for authentication tokens.

Tokens are delivered as HttpOnly cookies so client-side scripts cannot read
them, which removes the XSS token-theft vector of localStorage storage. The
CSRF cookie is deliberately readable so the frontend can echo it back in the
X-CSRFToken header for unsafe requests.
"""

from django.conf import settings
from django.middleware.csrf import rotate_token


def cookie_settings():
    """Shared cookie flags derived from settings."""
    return {
        'httponly': True,
        'secure': getattr(settings, 'AUTH_COOKIE_SECURE', not settings.DEBUG),
        'samesite': getattr(settings, 'AUTH_COOKIE_SAMESITE', 'Lax'),
        'domain': getattr(settings, 'AUTH_COOKIE_DOMAIN', None),
    }


def set_auth_cookies(response, access_token, refresh_token, access_lifetime, refresh_lifetime):
    """Attach access and refresh tokens as HttpOnly cookies."""
    config = cookie_settings()
    response.set_cookie(
        settings.AUTH_COOKIE_ACCESS,
        access_token,
        max_age=int(access_lifetime.total_seconds()),
        path='/',
        **config,
    )
    response.set_cookie(
        settings.AUTH_COOKIE_REFRESH,
        refresh_token,
        max_age=int(refresh_lifetime.total_seconds()),
        path='/',
        **config,
    )


def clear_auth_cookies(response):
    """Remove both auth cookies (used on logout)."""
    config = cookie_settings()
    for name in (settings.AUTH_COOKIE_ACCESS, settings.AUTH_COOKIE_REFRESH):
        response.delete_cookie(name, path='/', domain=config['domain'], samesite=config['samesite'])


def set_csrf_cookie(request, response):
    """
    Issue a readable CSRF cookie for the frontend to echo back.

    Rotating here invalidates any token issued before login, so a compromised
    page cannot replay a pre-authentication CSRF token after sign-in.
    """
    rotate_token(request)
    response.set_cookie(
        settings.AUTH_COOKIE_CSRF,
        request.META.get('CSRF_COOKIE', ''),
        max_age=60 * 60 * 24 * 7,
        path='/',
        httponly=False,
        secure=getattr(settings, 'AUTH_COOKIE_SECURE', not settings.DEBUG),
        samesite=getattr(settings, 'AUTH_COOKIE_SAMESITE', 'Lax'),
        domain=getattr(settings, 'AUTH_COOKIE_DOMAIN', None),
    )
