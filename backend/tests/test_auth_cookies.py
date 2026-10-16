"""
Test cases for HttpOnly cookie token transport and its CSRF protection.

Motion: tokens must never be readable by scripts, cookie-authenticated unsafe
requests must present the CSRF header, and the JSON transport escape hatch must
still work for non-browser clients.
"""

from django.conf import settings
from rest_framework.test import APIClient

from .test_utils import APITestCase

ACCESS_COOKIE = settings.AUTH_COOKIE_ACCESS
REFRESH_COOKIE = settings.AUTH_COOKIE_REFRESH
CSRF_COOKIE = settings.AUTH_COOKIE_CSRF


class CookieTransportTestCase(APITestCase):
    """Login and refresh must move tokens out of the JSON body."""

    def setUp(self):
        super().setUp()
        self.login_url = '/api/auth/login/'
        self.register_url = '/api/auth/register/'
        self.refresh_url = '/api/auth/refresh/'
        self.logout_url = '/api/auth/logout/'
        self.profile_url = '/api/auth/profile/'
        self.credentials = {'username': 'testuser', 'password': 'testpass123'}

    # COOKIE ISSUANCE
    def test_login_sets_access_and_refresh_cookies(self):
        """Login stores the JWT pair in cookies."""
        client = APIClient()
        response = client.post(self.login_url, self.credentials, format='json')
        self.assert_success_response(response)
        self.assertIn(ACCESS_COOKIE, response.cookies)
        self.assertIn(REFRESH_COOKIE, response.cookies)

    def test_login_keeps_tokens_out_of_body(self):
        """Token values are not returned in the JSON payload."""
        response = self.client.post(self.login_url, self.credentials, format='json')
        data = response.json()['data']
        self.assertNotIn('access', data)
        self.assertNotIn('refresh', data)
        # Expiry metadata and the session id remain available to the client.
        self.assertIn('expires_in', data)
        self.assertIn('session_id', data)

    def test_auth_cookies_are_httponly(self):
        """Access and refresh cookies are not script-readable."""
        response = self.client.post(self.login_url, self.credentials, format='json')
        self.assertTrue(response.cookies[ACCESS_COOKIE]['httponly'])
        self.assertTrue(response.cookies[REFRESH_COOKIE]['httponly'])

    def test_auth_cookies_use_samesite_flag(self):
        """Cookies carry the configured SameSite policy."""
        response = self.client.post(self.login_url, self.credentials, format='json')
        expected = getattr(settings, 'AUTH_COOKIE_SAMESITE', 'Lax')
        self.assertEqual(response.cookies[ACCESS_COOKIE]['samesite'], expected)

    def test_csrf_cookie_is_readable_by_script(self):
        """The CSRF cookie must be readable so the header can be set."""
        response = self.client.post(self.login_url, self.credentials, format='json')
        self.assertIn(CSRF_COOKIE, response.cookies)
        self.assertFalse(response.cookies[CSRF_COOKIE]['httponly'])

    def test_register_sets_cookies(self):
        """Registration also delivers tokens as cookies."""
        client = APIClient()
        response = client.post(self.register_url, {
            'username': 'cookieuser', 'email': 'cookieuser@example.com',
            'first_name': 'Ck', 'last_name': 'User',
            'password': 'cookiepass123', 'password_confirm': 'cookiepass123',
        }, format='json')
        self.assert_created_response(response)
        self.assertIn(ACCESS_COOKIE, response.cookies)

    def test_json_transport_still_available(self):
        """Clients can opt into tokens in the body for non-browser use."""
        response = self.client.post(
            f'{self.login_url}?transport=json', self.credentials, format='json'
        )
        data = response.json()['data']
        self.assertIn('access', data)
        self.assertIn('refresh', data)

    # AUTHENTICATION VIA COOKIE
    def test_cookie_authenticates_requests(self):
        """Requests with the access cookie are authenticated."""
        client = APIClient()
        client.post(self.login_url, self.credentials, format='json')
        response = client.get(self.profile_url)
        self.assert_success_response(response)
        self.assertEqual(response.json()['data']['username'], 'testuser')

    def test_header_takes_precedence_over_cookie(self):
        """A bearer token in the header wins over the cookie."""
        data = self.client.post(
            f'{self.login_url}?transport=json', self.credentials, format='json'
        ).json()['data']

        # The cookie for the same session must still be accepted, and the
        # header-authenticated request must succeed as well.
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        response = self.client.get(self.profile_url)
        self.assert_success_response(response)
        self.assertEqual(response.json()['data']['username'], 'testuser')

    def test_tampered_access_cookie_is_rejected(self):
        """A modified access cookie cannot authenticate."""
        client = APIClient()
        client.post(self.login_url, self.credentials, format='json')
        token = client.cookies[ACCESS_COOKIE].value
        client.cookies[ACCESS_COOKIE] = token[:-4] + 'abcd'
        response = client.get(self.profile_url)
        self.assert_error_response(response, 401, 'UNAUTHORIZED')

    def test_requests_without_cookie_and_header_are_unauthorized(self):
        """Anonymous access is rejected."""
        self.unauthenticate()
        self.assert_unauthorized_response(self.client.get(self.profile_url))

    # CSRF PROTECTION
    def test_unsafe_request_without_csrf_header_is_rejected(self):
        """A cross-site PATCH carrying only cookies must fail."""
        # enforce_csrf_checks keeps the test client from skipping CSRF.
        client = APIClient(enforce_csrf_checks=True)
        client.post(self.login_url, self.credentials, format='json')
        response = client.patch(self.profile_url, {'phone': '123'}, format='json')
        self.assert_error_response(response, 403, 'FORBIDDEN')

    def test_unsafe_request_with_csrf_header_succeeds(self):
        """A PATCH presenting the matching CSRF header is accepted."""
        client = APIClient()
        login = client.post(self.login_url, self.credentials, format='json')
        client.cookies[CSRF_COOKIE] = login.cookies[CSRF_COOKIE].value
        response = client.patch(
            self.profile_url, {'phone': '123'}, format='json',
            HTTP_X_CSRFTOKEN=login.cookies[CSRF_COOKIE].value,
        )
        self.assert_success_response(response)
        self.user.refresh_from_db()
        self.assertEqual(self.user.phone, '123')

    def test_get_request_without_csrf_header_succeeds(self):
        """Safe methods need no CSRF token."""
        client = APIClient(enforce_csrf_checks=True)
        client.post(self.login_url, self.credentials, format='json')
        response = client.get(self.profile_url)
        self.assert_success_response(response)

    def test_login_is_csrf_protected(self):
        """Even login requires the CSRF header when a cookie is present."""
        client = APIClient(enforce_csrf_checks=True)
        # First sign-in establishes cookies; a stale cookie then forces the
        # cookie-authenticated path on the next unsafe request.
        client.post(self.login_url, self.credentials, format='json')
        response = client.post(self.login_url, self.credentials, format='json')
        self.assert_error_response(response, 403, 'FORBIDDEN')

    def test_header_authenticated_request_skips_csrf(self):
        """Bearer-token requests are exempt from CSRF by design."""
        client = APIClient(enforce_csrf_checks=True)
        data = client.post(
            f'{self.login_url}?transport=json', self.credentials, format='json'
        ).json()['data']
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        response = client.patch(self.profile_url, {'phone': '555'}, format='json')
        self.assert_success_response(response)

    # REFRESH VIA COOKIE
    def test_refresh_rotates_cookie(self):
        """Refresh issues a new cookie pair and invalidates the old one."""
        client = APIClient()
        client.post(self.login_url, self.credentials, format='json')
        original = client.cookies[REFRESH_COOKIE].value
        response = client.post(self.refresh_url, {}, format='json')
        self.assert_success_response(response)
        self.assertNotEqual(client.cookies[REFRESH_COOKIE].value, original)

    def test_refresh_keeps_tokens_out_of_body(self):
        """Refresh responses do not expose tokens either."""
        client = APIClient()
        client.post(self.login_url, self.credentials, format='json')
        response = client.post(self.refresh_url, {}, format='json')
        data = response.json()['data']
        self.assertNotIn('access', data)
        self.assertNotIn('refresh', data)

    def test_rotated_cookie_cannot_be_replayed(self):
        """A refresh cookie is single use."""
        client = APIClient()
        client.post(self.login_url, self.credentials, format='json')
        original = client.cookies[REFRESH_COOKIE].value
        client.post(self.refresh_url, {}, format='json')
        client.cookies[REFRESH_COOKIE] = original
        response = client.post(self.refresh_url, {}, format='json')
        self.assert_error_response(response, 401, 'UNAUTHORIZED')

    # LOGOUT
    def test_logout_clears_auth_cookies(self):
        """Logout removes both auth cookies."""
        client = APIClient()
        client.post(self.login_url, self.credentials, format='json')
        response = client.post(self.logout_url, {}, format='json')
        self.assert_success_response(response)
        # Deletion is signalled with an empty, immediately expiring cookie.
        self.assertEqual(response.cookies[ACCESS_COOKIE].value, '')
        self.assertEqual(response.cookies[REFRESH_COOKIE].value, '')

    def test_logout_invalidates_refresh_cookie(self):
        """The refresh cookie no longer works after logout."""
        client = APIClient()
        client.post(self.login_url, self.credentials, format='json')
        client.post(self.logout_url, {}, format='json')
        response = client.post(self.refresh_url, {}, format='json')
        self.assert_error_response(response, 401, 'UNAUTHORIZED')

    def test_logout_via_cookie_only(self):
        """Logout works when the refresh token lives solely in the cookie."""
        client = APIClient()
        client.post(self.login_url, self.credentials, format='json')
        # Drop the header: the caller is identified only by their cookies.
        response = client.post(self.logout_url, {}, format='json')
        self.assert_success_response(response)
