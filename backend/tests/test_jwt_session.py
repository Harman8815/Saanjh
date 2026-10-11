"""
Test cases for JWT token expiry, refresh rotation, logout blacklisting and
concurrent session limits.
"""

from django.conf import settings
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from accounts.models import UserSession
from .test_utils import APITestCase


class JWTAuthenticationTestCase(APITestCase):
    """Test cases for JWT access/refresh token handling."""

    def setUp(self):
        super().setUp()
        self.login_url = '/api/auth/login/'
        self.register_url = '/api/auth/register/'
        self.logout_url = '/api/auth/logout/'
        self.refresh_url = '/api/auth/refresh/'
        self.sessions_url = '/api/auth/sessions/'

    def _login(self, username='testuser', password='testpass123'):
        response = self.client.post(
            self.login_url, {'username': username, 'password': password}, format='json'
        )
        self.assert_success_response(response, message='Login successful')
        return response.json()['data']

    # LOGIN ISSUES A JWT PAIR
    def test_login_returns_access_and_refresh_tokens(self):
        """Login returns a JWT access/refresh pair plus expiry metadata."""
        data = self._login()
        self.assertIn('access', data)
        self.assertIn('refresh', data)
        self.assertIn('expires_in', data)
        self.assertIn('session_id', data)

    def test_login_returns_positive_access_token_expiry(self):
        """The reported expiry matches the access token lifetime and is positive."""
        data = self._login()
        token = AccessToken(data['access'])
        self.assertGreater(token['exp'], token['iat'])
        self.assertEqual(data['expires_in'], int(token['exp'] - token['iat']))

    def test_access_token_lifetime_is_short_lived(self):
        """Access tokens expire well within a day."""
        lifetime = api_settings.ACCESS_TOKEN_LIFETIME
        self.assertLessEqual(lifetime.total_seconds(), 24 * 60 * 60)
        self.assertGreater(lifetime.total_seconds(), 0)

    def test_register_returns_jwt_pair(self):
        """Registration also issues a JWT access/refresh pair."""
        response = self.client.post(self.register_url, {
            'username': 'jwtnewuser',
            'email': 'jwtnew@example.com',
            'first_name': 'Jwt',
            'last_name': 'User',
            'password': 'jwtpass123',
            'password_confirm': 'jwtpass123',
        }, format='json')
        self.assert_created_response(response, message='Registration successful')
        data = response.json()['data']
        self.assertIn('access', data)
        self.assertIn('refresh', data)

    def test_access_token_authenticates_bearer_requests(self):
        """The issued access token works as a Bearer credential."""
        data = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        response = self.client.get('/api/auth/profile/')
        self.assert_success_response(response, message='Profile retrieved successfully')
        self.assertEqual(response.json()['data']['username'], 'testuser')

    def test_expired_access_token_is_rejected(self):
        """An access token past its expiry is refused."""
        from datetime import timedelta
        data = self._login()
        token = AccessToken(data['access'])
        # Push the expiry into the past; the signature stays valid.
        token.set_exp(
            from_time=token.current_time - timedelta(hours=1),
            lifetime=timedelta(minutes=5),
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(token)}")
        response = self.client.get('/api/auth/profile/')
        self.assert_error_response(response, 401, 'UNAUTHORIZED')

    def test_tampered_access_token_is_rejected(self):
        """A token whose signature no longer matches is refused."""
        data = self._login()
        tampered = data['access'][:-4] + ('abcd' if not data['access'].endswith('abcd') else 'efgh')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tampered}")
        response = self.client.get('/api/auth/profile/')
        self.assert_error_response(response, 401, 'UNAUTHORIZED')

    # REFRESH ROTATION
    def test_refresh_returns_new_token_pair(self):
        """Refreshing returns a new access token and a rotated refresh token."""
        data = self._login()
        response = self.client.post(
            self.refresh_url, {'refresh': data['refresh']}, format='json'
        )
        self.assert_success_response(response, message='Token refreshed successfully')
        new_data = response.json()['data']
        self.assertIn('access', new_data)
        self.assertNotEqual(new_data['refresh'], data['refresh'])

    def test_refresh_token_cannot_be_reused(self):
        """A refresh token is single-use: reuse after rotation is rejected."""
        data = self._login()
        response = self.client.post(
            self.refresh_url, {'refresh': data['refresh']}, format='json'
        )
        self.assert_success_response(response)
        replay = self.client.post(
            self.refresh_url, {'refresh': data['refresh']}, format='json'
        )
        self.assert_error_response(replay, 401, 'UNAUTHORIZED')

    def test_refresh_blacklists_presented_token(self):
        """The consumed refresh token is recorded in the blacklist."""
        data = self._login()
        token = RefreshToken(data['refresh'])
        self.client.post(self.refresh_url, {'refresh': data['refresh']}, format='json')
        self.assertTrue(
            BlacklistedToken.objects.filter(token__jti=token['jti']).exists()
        )

    def test_new_access_token_after_refresh_is_usable(self):
        """The rotated access token authenticates requests."""
        data = self._login()
        response = self.client.post(
            self.refresh_url, {'refresh': data['refresh']}, format='json'
        )
        new_access = response.json()['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_access}")
        profile = self.client.get('/api/auth/profile/')
        self.assert_success_response(profile)

    def test_refresh_with_invalid_token_is_rejected(self):
        """An unknown refresh token is refused."""
        response = self.client.post(
            self.refresh_url, {'refresh': 'not-a-real-token'}, format='json'
        )
        self.assert_error_response(response, 401, 'UNAUTHORIZED')

    def test_refresh_without_token_unauthenticated_is_rejected(self):
        """An unauthenticated refresh with no refresh token is refused."""
        response = self.client.post(self.refresh_url, {}, format='json')
        self.assert_error_response(response, 401, 'UNAUTHORIZED')

    # LOGOUT BLACKLISTING
    def test_logout_blacklists_presented_refresh_token(self):
        """Logout records the refresh token in the blacklist."""
        data = self._login()
        token = RefreshToken(data['refresh'])
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        response = self.client.post(
            self.logout_url, {'refresh': data['refresh']}, format='json'
        )
        self.assert_success_response(response, message='Logout successful')
        self.assertTrue(
            BlacklistedToken.objects.filter(token__jti=token['jti']).exists()
        )

    def test_logged_out_refresh_token_cannot_be_reused(self):
        """A refresh token used at logout no longer works."""
        data = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        self.client.post(self.logout_url, {'refresh': data['refresh']}, format='json')
        replay = self.client.post(
            self.refresh_url, {'refresh': data['refresh']}, format='json'
        )
        self.assert_error_response(replay, 401, 'UNAUTHORIZED')

    def test_logout_deactivates_session(self):
        """Logout marks the session inactive."""
        data = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        self.client.post(self.logout_url, {'refresh': data['refresh']}, format='json')
        self.assertFalse(
            UserSession.objects.filter(id=data['session_id'], is_active=True).exists()
        )

    def test_logout_all_devices_revokes_every_session(self):
        """The all_devices flag revokes every active session."""
        first = self._login()
        second = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {second['access']}")
        response = self.client.post(
            self.logout_url, {'refresh': second['refresh'], 'all_devices': True},
            format='json'
        )
        self.assert_success_response(response)
        self.assertEqual(
            UserSession.objects.filter(user=self.user, is_active=True).count(), 0
        )
        # Both refresh tokens are now unusable.
        for payload in (first, second):
            replay = self.client.post(
                self.refresh_url, {'refresh': payload['refresh']}, format='json'
            )
            self.assert_error_response(replay, 401, 'UNAUTHORIZED')

    def test_logout_without_refresh_token_still_succeeds(self):
        """Legacy clients that send no refresh token still log out cleanly."""
        data = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        response = self.client.post(self.logout_url, {}, format='json')
        self.assert_success_response(response, message='Logout successful')

    def test_logout_with_unknown_refresh_token_is_rejected(self):
        """Logout refuses a refresh token it does not recognise."""
        data = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        response = self.client.post(
            self.logout_url, {'refresh': 'not-a-real-token'}, format='json'
        )
        self.assert_error_response(response, 401, 'UNAUTHORIZED')

    # CONCURRENT SESSION LIMIT
    def test_login_creates_session_record(self):
        """Each login registers an active session for the user."""
        self.assertEqual(UserSession.objects.filter(user=self.user).count(), 0)
        data = self._login()
        session = UserSession.objects.get(id=data['session_id'])
        self.assertTrue(session.is_active)
        self.assertEqual(session.user, self.user)

    def test_concurrent_sessions_are_capped(self):
        """Repeated logins never exceed the configured session limit."""
        limit = getattr(settings, 'MAX_CONCURRENT_SESSIONS', 3)
        for _ in range(limit + 3):
            self._login()
            active = UserSession.objects.filter(user=self.user, is_active=True)
            self.assertLessEqual(active.count(), limit)

    def test_oldest_session_is_evicted(self):
        """Exceeding the limit revokes the oldest session first."""
        limit = getattr(settings, 'MAX_CONCURRENT_SESSIONS', 3)
        sessions = []
        for _ in range(limit + 1):
            data = self._login()
            sessions.append(data['session_id'])
        # The earliest session is gone, the newest survives.
        self.assertFalse(
            UserSession.objects.filter(id=sessions[0], is_active=True).exists()
        )
        self.assertTrue(
            UserSession.objects.filter(id=sessions[-1], is_active=True).exists()
        )

    def test_evicted_refresh_token_is_blacklisted(self):
        """A session evicted by the limit can no longer refresh."""
        limit = getattr(settings, 'MAX_CONCURRENT_SESSIONS', 3)
        first = self._login()
        first_jti = RefreshToken(first['refresh'])['jti']
        for _ in range(limit):
            self._login()
        replay = self.client.post(
            self.refresh_url, {'refresh': first['refresh']}, format='json'
        )
        self.assert_error_response(replay, 401, 'UNAUTHORIZED')
        self.assertTrue(
            BlacklistedToken.objects.filter(token__jti=first_jti).exists()
        )

    # SESSION MANAGEMENT ENDPOINTS
    def test_session_list_returns_active_sessions(self):
        """The sessions endpoint lists the caller's active sessions."""
        data = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        response = self.client.get(self.sessions_url)
        self.assert_success_response(response, message='Sessions retrieved successfully')
        sessions = response.json()['data']
        self.assertEqual(len(sessions), 1)
        self.assertTrue(sessions[0]['current'])

    def test_session_revoke_deactivates_session(self):
        """Revoking a session blacklists its refresh token."""
        data = self._login()
        jti = RefreshToken(data['refresh'])['jti']
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        response = self.client.post(
            f"/api/auth/sessions/{data['session_id']}/revoke/", {}, format='json'
        )
        self.assert_success_response(response, message='Session revoked successfully')
        self.assertTrue(
            BlacklistedToken.objects.filter(token__jti=jti).exists()
        )
        replay = self.client.post(
            self.refresh_url, {'refresh': data['refresh']}, format='json'
        )
        self.assert_error_response(replay, 401, 'UNAUTHORIZED')

    def test_session_revoke_unknown_id_is_not_found(self):
        """Revoking a session that does not belong to the caller 404s."""
        import uuid
        data = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        response = self.client.post(
            f"/api/auth/sessions/{uuid.uuid4()}/revoke/", {}, format='json'
        )
        self.assert_error_response(response, 404, 'NOT_FOUND')

    def test_session_endpoints_require_authentication(self):
        """Session management requires a valid credential."""
        self.assert_error_response(self.client.get(self.sessions_url), 401, 'UNAUTHORIZED')

    # SESSION BINDING
    def test_access_token_carries_session_claim(self):
        """Access tokens identify the session they were issued for."""
        data = self._login()
        token = AccessToken(data['access'])
        self.assertEqual(str(token['session_id']), data['session_id'])

    def test_rotated_access_token_keeps_session_binding(self):
        """Rotation preserves the session claim on the new access token."""
        data = self._login()
        response = self.client.post(
            self.refresh_url, {'refresh': data['refresh']}, format='json'
        )
        new_token = AccessToken(response.json()['data']['access'])
        self.assertEqual(str(new_token['session_id']), data['session_id'])
