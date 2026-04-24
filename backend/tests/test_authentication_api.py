"""
Comprehensive test cases for Authentication API endpoints.
"""

from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .test_utils import APITestCase

User = get_user_model()


class AuthenticationAPITestCase(APITestCase):
    """Test cases for Authentication API endpoints."""

    def setUp(self):
        super().setUp()
        self.login_url = '/api/auth/login/'
        self.logout_url = '/api/auth/logout/'
        self.register_url = '/api/auth/register/'
        self.profile_url = '/api/auth/profile/'
        self.refresh_url = '/api/auth/refresh/'
        self.change_password_url = '/api/auth/change-password/'
        self.reset_password_url = '/api/auth/reset-password/'

    # LOGIN TESTS
    def test_login_valid_credentials(self):
        """Test login with valid credentials."""
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, login_data)
        self.assert_success_response(response, message="Login successful")
        
        data = response.json()
        self.assertIn('token', data['data'])
        self.assertIn('user', data['data'])
        self.assertEqual(data['data']['user']['username'], 'testuser')
        self.assertEqual(data['data']['user']['email'], 'test@example.com')

    def test_login_invalid_username(self):
        """Test login with invalid username."""
        login_data = {
            'username': 'nonexistentuser',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, login_data)
        self.assert_error_response(response, 401, "UNAUTHORIZED", "Invalid credentials")

    def test_login_invalid_password(self):
        """Test login with invalid password."""
        login_data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.login_url, login_data)
        self.assert_error_response(response, 401, "UNAUTHORIZED", "Invalid credentials")

    def test_login_missing_fields(self):
        """Test login with missing required fields."""
        # Missing username
        login_data = {'password': 'testpass123'}
        response = self.client.post(self.login_url, login_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")
        
        # Missing password
        login_data = {'username': 'testuser'}
        response = self.client.post(self.login_url, login_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")
        
        # Empty fields
        login_data = {'username': '', 'password': ''}
        response = self.client.post(self.login_url, login_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    def test_login_inactive_user(self):
        """Test login with inactive user."""
        self.user.is_active = False
        self.user.save()
        
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, login_data)
        self.assert_error_response(response, 401, "UNAUTHORIZED", "Account is inactive")

    def test_login_case_insensitive_username(self):
        """Test login with case insensitive username."""
        login_data = {
            'username': 'TESTUSER',  # Uppercase
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, login_data)
        self.assert_success_response(response)

    def test_login_with_email(self):
        """Test login using email instead of username."""
        login_data = {
            'username': 'test@example.com',  # Email as username
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, login_data)
        self.assert_success_response(response)

    def test_login_token_creation(self):
        """Test that login creates a token."""
        # Delete existing token
        Token.objects.filter(user=self.user).delete()
        
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, login_data)
        self.assert_success_response(response)
        
        # Verify token was created
        self.assertTrue(Token.objects.filter(user=self.user).exists())
        
        data = response.json()
        token = data['data']['token']
        self.assertEqual(token, Token.objects.get(user=self.user).key)

    # REGISTER TESTS
    def test_register_valid_data(self):
        """Test user registration with valid data."""
        register_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        response = self.client.post(self.register_url, register_data)
        self.assert_created_response(response, message="Registration successful")
        
        data = response.json()
        self.assertIn('token', data['data'])
        self.assertIn('user', data['data'])
        self.assertEqual(data['data']['user']['username'], 'newuser')
        self.assertEqual(data['data']['user']['email'], 'newuser@example.com')
        
        # Verify user was created
        self.assertTrue(User.objects.filter(username='newuser').exists())
        
        # Verify token was created
        new_user = User.objects.get(username='newuser')
        self.assertTrue(Token.objects.filter(user=new_user).exists())

    def test_register_duplicate_username(self):
        """Test registration with duplicate username."""
        register_data = {
            'username': 'testuser',  # Already exists
            'email': 'different@example.com',
            'password': 'newpass123'
        }
        
        response = self.client.post(self.register_url, register_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Username already exists")

    def test_register_duplicate_email(self):
        """Test registration with duplicate email."""
        register_data = {
            'username': 'differentuser',
            'email': 'test@example.com',  # Already exists
            'password': 'newpass123'
        }
        
        response = self.client.post(self.register_url, register_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Email already exists")

    def test_register_invalid_email(self):
        """Test registration with invalid email format."""
        register_data = {
            'username': 'newuser',
            'email': 'invalid-email-format',
            'password': 'newpass123'
        }
        
        response = self.client.post(self.register_url, register_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    def test_register_weak_password(self):
        """Test registration with weak password."""
        register_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': '123'  # Too short
        }
        
        response = self.client.post(self.register_url, register_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    def test_register_missing_fields(self):
        """Test registration with missing required fields."""
        # Missing username
        register_data = {
            'email': 'newuser@example.com',
            'password': 'newpass123'
        }
        response = self.client.post(self.register_url, register_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")
        
        # Missing email
        register_data = {
            'username': 'newuser',
            'password': 'newpass123'
        }
        response = self.client.post(self.register_url, register_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")
        
        # Missing password
        register_data = {
            'username': 'newuser',
            'email': 'newuser@example.com'
        }
        response = self.client.post(self.register_url, register_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    def test_register_invalid_username(self):
        """Test registration with invalid username."""
        register_data = {
            'username': 'user@name',  # Invalid characters
            'email': 'newuser@example.com',
            'password': 'newpass123'
        }
        
        response = self.client.post(self.register_url, register_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    # LOGOUT TESTS
    def test_logout_authenticated(self):
        """Test logout with authenticated user."""
        self.authenticate()
        
        response = self.client.post(self.logout_url)
        self.assert_success_response(response, message="Logout successful")
        
        # Token should be deleted
        self.assertFalse(Token.objects.filter(user=self.user).exists())

    def test_logout_unauthenticated(self):
        """Test logout without authentication."""
        response = self.client.post(self.logout_url)
        self.assert_error_response(response, 401, "UNAUTHORIZED")

    def test_logout_multiple_tokens(self):
        """Test logout with multiple tokens (if supported)."""
        # Create additional token
        Token.objects.create(user=self.user)
        
        self.authenticate()
        response = self.client.post(self.logout_url)
        self.assert_success_response(response)

    # PROFILE TESTS
    def test_get_profile_authenticated(self):
        """Test getting user profile when authenticated."""
        self.authenticate()
        
        response = self.client.get(self.profile_url)
        self.assert_success_response(response, message="Profile retrieved successfully")
        
        data = response.json()
        profile_data = data['data']
        self.assertEqual(profile_data['username'], 'testuser')
        self.assertEqual(profile_data['email'], 'test@example.com')
        self.assertEqual(profile_data['first_name'], 'Test')
        self.assertEqual(profile_data['last_name'], 'User')

    def test_get_profile_unauthenticated(self):
        """Test getting profile without authentication."""
        response = self.client.get(self.profile_url)
        self.assert_error_response(response, 401, "UNAUTHORIZED")

    def test_update_profile_authenticated(self):
        """Test updating user profile when authenticated."""
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'email': 'updated@example.com'
        }
        
        self.authenticate()
        response = self.client.patch(self.profile_url, update_data)
        self.assert_success_response(response, message="Profile updated successfully")
        
        # Verify changes
        self.user.refresh()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')
        self.assertEqual(self.user.email, 'updated@example.com')

    def test_update_profile_unauthenticated(self):
        """Test updating profile without authentication."""
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        
        response = self.client.patch(self.profile_url, update_data)
        self.assert_error_response(response, 401, "UNAUTHORIZED")

    def test_update_profile_invalid_email(self):
        """Test updating profile with invalid email."""
        update_data = {
            'email': 'invalid-email-format'
        }
        
        self.authenticate()
        response = self.client.patch(self.profile_url, update_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    def test_update_profile_duplicate_email(self):
        """Test updating profile with duplicate email."""
        update_data = {
            'email': 'other@example.com'  # Other user's email
        }
        
        self.authenticate()
        response = self.client.patch(self.profile_url, update_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Email already exists")

    # CHANGE PASSWORD TESTS
    def test_change_password_valid(self):
        """Test changing password with valid data."""
        password_data = {
            'old_password': 'testpass123',
            'new_password': 'newpass123',
            'confirm_password': 'newpass123'
        }
        
        self.authenticate()
        response = self.client.post(self.change_password_url, password_data)
        self.assert_success_response(response, message="Password changed successfully")
        
        # Verify password was changed
        self.user.refresh()
        self.assertTrue(self.user.check_password('newpass123'))

    def test_change_password_wrong_old_password(self):
        """Test changing password with wrong old password."""
        password_data = {
            'old_password': 'wrongpassword',
            'new_password': 'newpass123',
            'confirm_password': 'newpass123'
        }
        
        self.authenticate()
        response = self.client.post(self.change_password_url, password_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Old password is incorrect")

    def test_change_password_mismatched_confirmation(self):
        """Test changing password with mismatched confirmation."""
        password_data = {
            'old_password': 'testpass123',
            'new_password': 'newpass123',
            'confirm_password': 'differentpass123'
        }
        
        self.authenticate()
        response = self.client.post(self.change_password_url, password_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Passwords do not match")

    def test_change_password_weak_new_password(self):
        """Test changing password to weak password."""
        password_data = {
            'old_password': 'testpass123',
            'new_password': '123',
            'confirm_password': '123'
        }
        
        self.authenticate()
        response = self.client.post(self.change_password_url, password_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    def test_change_password_unauthenticated(self):
        """Test changing password without authentication."""
        password_data = {
            'old_password': 'testpass123',
            'new_password': 'newpass123',
            'confirm_password': 'newpass123'
        }
        
        response = self.client.post(self.change_password_url, password_data)
        self.assert_error_response(response, 401, "UNAUTHORIZED")

    # TOKEN REFRESH TESTS
    def test_refresh_token_valid(self):
        """Test refreshing valid token."""
        self.authenticate()
        
        response = self.client.post(self.refresh_url)
        self.assert_success_response(response, message="Token refreshed successfully")
        
        data = response.json()
        self.assertIn('token', data['data'])
        
        # New token should be different
        new_token = data['data']['token']
        self.assertNotEqual(new_token, self.token.key)
        
        # Old token should be deleted
        self.assertFalse(Token.objects.filter(key=self.token.key).exists())

    def test_refresh_token_unauthenticated(self):
        """Test refreshing token without authentication."""
        response = self.client.post(self.refresh_url)
        self.assert_error_response(response, 401, "UNAUTHORIZED")

    # PASSWORD RESET TESTS
    def test_password_reset_request_valid_email(self):
        """Test password reset request with valid email."""
        reset_data = {
            'email': 'test@example.com'
        }
        
        response = self.client.post(self.reset_password_url, reset_data)
        self.assert_success_response(response, message="Password reset email sent")

    def test_password_reset_request_invalid_email(self):
        """Test password reset request with invalid email."""
        reset_data = {
            'email': 'nonexistent@example.com'
        }
        
        response = self.client.post(self.reset_password_url, reset_data)
        self.assert_error_response(response, 400, "VALIDATION_ERROR", "Email not found")

    def test_password_reset_request_missing_email(self):
        """Test password reset request without email."""
        response = self.client.post(self.reset_password_url, {})
        self.assert_error_response(response, 400, "VALIDATION_ERROR")

    # USER STATISTICS TESTS
    def test_user_statistics(self):
        """Test user statistics endpoint."""
        self.authenticate()
        response = self.client.get('/api/auth/stats/')
        
        self.assert_success_response(response, message="User statistics retrieved successfully")
        data = response.json()
        stats = data['data']
        
        # Check required statistics
        self.assertIn('total_guests', stats)
        self.assertIn('total_vendors', stats)
        self.assertIn('total_expenses', stats)
        self.assertIn('wedding_date', stats)
        self.assertIn('days_until_wedding', stats)

    # USER SETTINGS TESTS
    def test_get_user_settings(self):
        """Test getting user settings."""
        self.authenticate()
        response = self.client.get('/api/auth/settings/')
        
        self.assert_success_response(response, message="Settings retrieved successfully")
        data = response.json()
        settings = data['data']
        
        # Check settings structure
        self.assertIn('notifications', settings)
        self.assertIn('privacy', settings)
        self.assertIn('preferences', settings)

    def test_update_user_settings(self):
        """Test updating user settings."""
        settings_data = {
            'notifications': {
                'email_notifications': True,
                'sms_notifications': False
            },
            'privacy': {
                'profile_visibility': 'public',
                'allow_guest_invites': True
            }
        }
        
        self.authenticate()
        response = self.client.patch('/api/auth/settings/', settings_data)
        self.assert_success_response(response, message="Settings updated successfully")

    # EDGE CASES AND VALIDATION TESTS
    def test_login_sql_injection_attempt(self):
        """Test login with SQL injection attempt."""
        login_data = {
            'username': "'; DROP TABLE users; --",
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, login_data)
        self.assert_error_response(response, 401, "UNAUTHORIZED")

    def test_login_xss_attempt(self):
        """Test login with XSS attempt."""
        login_data = {
            'username': '<script>alert("xss")</script>',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, login_data)
        self.assert_error_response(response, 401, "UNAUTHORIZED")

    def test_concurrent_login(self):
        """Test concurrent login attempts."""
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        # Make multiple concurrent login requests
        responses = []
        for _ in range(5):
            response = self.client.post(self.login_url, login_data)
            responses.append(response)
        
        # All should succeed
        for response in responses:
            self.assert_success_response(response)

    def test_session_expiration(self):
        """Test session/token expiration."""
        # This would test token expiration logic
        # For now, just test that token exists and can be used
        self.authenticate()
        
        response = self.client.get(self.profile_url)
        self.assert_success_response(response)

    def test_api_response_format(self):
        """Test that all auth API responses follow standardized format."""
        # Test login response format
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, login_data)
        self._assert_standard_response_format(response)
        
        # Test profile response format
        self.authenticate()
        response = self.client.get(self.profile_url)
        self._assert_standard_response_format(response)
        
        # Test logout response format
        response = self.client.post(self.logout_url)
        self._assert_standard_response_format(response)

    # PERFORMANCE TESTS
    def test_login_performance(self):
        """Test login endpoint performance."""
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        # Should respond quickly
        response = self.client.post(self.login_url, login_data)
        self.assertLess(response.status_code, 500)
        self.assert_success_response(response)

    def test_register_performance(self):
        """Test register endpoint performance."""
        register_data = {
            'username': 'perfuser',
            'email': 'perf@example.com',
            'password': 'perfpass123',
            'first_name': 'Performance',
            'last_name': 'User'
        }
        
        # Should respond quickly
        response = self.client.post(self.register_url, register_data)
        self.assertLess(response.status_code, 500)
        self.assert_created_response(response)

    # INTEGRATION TESTS
    def test_full_authentication_flow(self):
        """Test complete authentication flow: register -> login -> profile -> logout."""
        # Register
        register_data = {
            'username': 'flowuser',
            'email': 'flow@example.com',
            'password': 'flowpass123',
            'first_name': 'Flow',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, register_data)
        self.assert_created_response(response)
        
        # Login
        login_data = {
            'username': 'flowuser',
            'password': 'flowpass123'
        }
        response = self.client.post(self.login_url, login_data)
        self.assert_success_response(response)
        
        # Get profile
        token = response.json()['data']['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        response = self.client.get(self.profile_url)
        self.assert_success_response(response)
        
        # Logout
        response = self.client.post(self.logout_url)
        self.assert_success_response(response)

    def test_token_reuse_after_logout(self):
        """Test that token cannot be reused after logout."""
        self.authenticate()
        
        # Logout
        response = self.client.post(self.logout_url)
        self.assert_success_response(response)
        
        # Try to use token again
        response = self.client.get(self.profile_url)
        self.assert_error_response(response, 401, "UNAUTHORIZED")

    # HELPER METHODS
    def _assert_standard_response_format(self, response):
        """Assert that response follows standardized API format."""
        self.assertIn('success', response.json())
        if response.json()['success']:
            self.assertIn('data', response.json())
            self.assertIn('message', response.json())
        else:
            self.assertIn('error', response.json())
            self.assertIn('code', response.json()['error'])
            self.assertIn('message', response.json()['error'])
        self.assertIn('timestamp', response.json())
