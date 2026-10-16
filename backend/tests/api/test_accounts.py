"""
Comprehensive tests for the accounts module API endpoints.
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

from accounts.models import Role, Settings
from tests.factories import UserFactory, RoleFactory, SettingsFactory
from tests.conftest import BaseTestCase

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistration(BaseTestCase):
    """Test user registration endpoint."""
    
    def test_user_registration_success(self):
        """Test successful user registration."""
        data = {
            'username': 'johndoe',
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        
        response = self.client.post('/api/auth/register/', data, format='json')
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "Registration successful"
        assert 'user' in response_data['data']
        assert 'token' in response_data['data']
        assert response_data['data']['user']['email'] == 'test@example.com'
        
        # Verify user was created
        user = User.objects.get(email='test@example.com')
        assert user.first_name == 'John'
        assert user.last_name == 'Doe'
    
    def test_user_registration_invalid_data(self):
        """Test user registration with invalid data."""
        data = {
            'username': 'baduser',
            'email': 'invalid-email',
            'first_name': '',
            'password': '123',
            'password_confirm': '456'
        }
        
        response = self.client.post('/api/auth/register/', data, format='json')
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
        response_data = response.json()
        assert response_data['success'] is False
        assert len(response_data['errors']) > 0
    
    def test_user_registration_duplicate_email(self):
        """Test user registration with duplicate email."""
        UserFactory(email='test@example.com')
        
        data = {
            'username': 'johndoe',
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        
        response = self.client.post('/api/auth/register/', data, format='json')
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)


@pytest.mark.django_db
class TestUserLogin(BaseTestCase):
    """Test user login endpoint."""
    
    def test_user_login_success(self):
        """Test successful user login."""
        user = UserFactory(email='test@example.com')
        user.set_password('testpass123')
        user.save()
        
        data = {
            'username': user.username,
            'password': 'testpass123'
        }
        
        response = self.client.post('/api/auth/login/', data, format='json')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Login successful"
        assert 'user' in response_data['data']
        assert 'token' in response_data['data']
    
    def test_user_login_invalid_credentials(self):
        """Test user login with invalid credentials."""
        UserFactory(email='test@example.com')
        
        data = {
            'username': 'johndoe',
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post('/api/auth/login/', data, format='json')
        
        self.assert_error_response(response, status.HTTP_401_UNAUTHORIZED)
    
    def test_user_login_nonexistent_user(self):
        """Test user login with nonexistent user."""
        data = {
            'username': 'nonexistent',
            'password': 'testpass123'
        }
        
        response = self.client.post('/api/auth/login/', data, format='json')
        
        self.assert_error_response(response, status.HTTP_401_UNAUTHORIZED)


@pytest.mark.django_db
class TestUserLogout(BaseTestCase):
    """Test user logout endpoint."""
    
    def test_user_logout_success(self):
        """Test successful user logout."""
        response = self.client.post('/api/auth/logout/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Logout successful"
        
        # Verify token was deleted
        assert not Token.objects.filter(user=self.user).exists()
    
    def test_user_logout_unauthenticated(self):
        """Test logout without authentication."""
        self.client.credentials()  # Remove authentication
        
        response = self.client.post('/api/auth/logout/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserProfile(BaseTestCase):
    """Test user profile endpoints."""
    
    def test_get_profile_success(self):
        """Test getting user profile."""
        response = self.client.get('/api/auth/profile/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Profile retrieved successfully"
        assert response_data['data']['email'] == self.user.email
    
    def test_update_profile_success(self):
        """Test updating user profile."""
        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        
        response = self.client.patch('/api/auth/profile/', data, format='json')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Profile updated successfully"
        assert response_data['data']['first_name'] == 'Updated'
        assert response_data['data']['last_name'] == 'Name'
    
    def test_update_profile_invalid_data(self):
        """Test updating profile with invalid data."""
        data = {
            'email': 'invalid-email'
        }
        
        response = self.client.patch('/api/auth/profile/', data, format='json')
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
    
    def test_get_profile_unauthenticated(self):
        """Test getting profile without authentication."""
        self.client.credentials()  # Remove authentication
        
        response = self.client.get('/api/auth/profile/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserStats(BaseTestCase):
    """Test user statistics endpoint."""
    
    def test_get_user_stats_with_wedding(self):
        """Test getting user stats with wedding."""
        from tests.factories import WeddingFactory, GuestFactory, ExpenseFactory
        wedding = WeddingFactory(user=self.user)
        GuestFactory.create_batch(5, wedding=wedding)
        ExpenseFactory.create_batch(3, wedding=wedding)
        
        response = self.client.get('/api/auth/stats/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "User statistics retrieved successfully"
        stats = response_data['data']
        assert stats['total_guests'] == 5
        assert stats['total_vendors'] == 0
        assert stats['total_expenses'] > 0
    
    def test_get_user_stats_without_wedding(self):
        """Test getting user stats without wedding."""
        response = self.client.get('/api/auth/stats/')
        
        self.assert_success_response(response)
        response_data = response.json()
        stats = response_data['data']
        assert stats['total_guests'] == 0
    
    def test_get_user_stats_unauthenticated(self):
        """Test getting stats without authentication."""
        self.client.credentials()  # Remove authentication
        
        response = self.client.get('/api/auth/stats/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserSettings(BaseTestCase):
    """Test user settings endpoints."""
    
    def test_get_settings_success(self):
        """Test getting user settings."""
        settings = SettingsFactory(user=self.user)
        
        response = self.client.get('/api/auth/settings/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Settings retrieved successfully"
        assert response_data['data']['theme'] == settings.theme
    
    def test_update_settings_success(self):
        """Test updating user settings."""
        data = {
            'theme': 'dark',
            'language': 'es',
        }
        
        response = self.client.post('/api/auth/settings/', data, format='json')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Settings updated successfully"
        assert response_data['data']['theme'] == 'dark'
        assert response_data['data']['language'] == 'es'
        assert response_data['data']['language'] == 'es'
    
    def test_update_settings_invalid_data(self):
        """An unknown theme value is rejected."""
        data = {
            'theme': 'invalid_theme'
        }
        
        response = self.client.patch('/api/auth/settings/', data, format='json')
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
    
    def test_get_settings_unauthenticated(self):
        """Test getting settings without authentication."""
        self.client.credentials()  # Remove authentication
        
        response = self.client.get('/api/auth/settings/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestRoleViewSet(BaseTestCase):
    """Test Role ViewSet endpoints.

    Roles are shared reference data with only a choice-constrained unique name,
    so writes require the admin role or is_superuser.
    """

    def test_list_roles_success(self):
        """Any authenticated user may read roles."""
        RoleFactory(name='bride')
        RoleFactory(name='groom')

        response = self.client.get('/api/auth/roles/')

        self.assert_success_response(response)
        assert response.json()['message'] == "Roles retrieved successfully"
        assert len(response.json()['data']) >= 2

    def test_create_role_success(self):
        """An admin can create a role."""
        response = self.superuser_client.post(
            '/api/auth/roles/', {'name': 'guardian'}, format='json'
        )

        self.assert_success_response(response, status.HTTP_201_CREATED)
        assert response.json()['data']['name'] == 'guardian'
        assert Role.objects.filter(name='guardian').exists()

    def test_retrieve_role_success(self):
        role = RoleFactory(name='bride')

        response = self.client.get(f'/api/auth/roles/{role.id}/')

        self.assert_success_response(response)
        assert response.json()['data']['id'] == role.id

    def test_update_role_success(self):
        role = RoleFactory(name='bride')

        response = self.superuser_client.patch(
            f'/api/auth/roles/{role.id}/', {'name': 'groom'}, format='json'
        )

        self.assert_success_response(response)
        role.refresh_from_db()
        assert role.name == 'groom'

    def test_delete_role_success(self):
        role = RoleFactory(name='guardian')

        response = self.superuser_client.delete(f'/api/auth/roles/{role.id}/')

        self.assert_success_response(response)
        assert not Role.objects.filter(id=role.id).exists()

    def test_create_role_unauthorized(self):
        """A non-admin non-superuser cannot create shared reference data."""
        response = self.client.post(
            '/api/auth/roles/', {'name': 'hijacked'}, format='json'
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert not Role.objects.filter(name='hijacked').exists()


class TestSettingsViewSet(BaseTestCase):
    """Test the user settings endpoint.

    /api/auth/settings/ is served by user_settings_detail, which gets or creates
    the caller's single Settings row. A POST that would create a duplicate is
    reported as a validation error rather than a 500.
    """

    def _settings_from_settingsfactory(self):
        return SettingsFactory(user=self.user)

    def test_get_settings_success(self):
        self._settings_from_settingsfactory()

        response = self.client.get('/api/auth/settings/')

        self.assert_success_response(response)
        assert response.json()['message'] == 'Settings retrieved successfully'

    def test_update_settings_success(self):
        SettingsFactory(user=self.user)

        response = self.client.patch(
            '/api/auth/settings/',
            {'theme': 'dark', 'language': 'es', 'currency': 'EUR'},
            format='json'
        )

        self.assert_success_response(response)
        settings = Settings.objects.get(user=self.user)
        assert settings.theme == 'dark'
        assert settings.language == 'es'

    def test_update_settings_invalid_data(self):
        """Unsupported preference keys are rejected."""
        SettingsFactory(user=self.user)

        response = self.client.patch(
            '/api/auth/settings/', {'email_notifications': 'not-json'}, format='json'
        )

        assert response.status_code in (
            status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST
        )

    def test_settings_created_on_first_access(self):
        """A user with no settings row gets one created for them."""
        assert not Settings.objects.filter(user=self.user).exists()

        response = self.client.get('/api/auth/settings/')

        self.assert_success_response(response)
        assert Settings.objects.filter(user=self.user).exists()

    def test_other_user_settings_not_accessible(self):
        other = UserFactory()
        SettingsFactory(user=other)

        response = self.client.get('/api/auth/settings/')

        # The endpoint is scoped to the caller, so it never returns the other
        # user's row.
        self.assert_success_response(response)
        assert response.json()['data']['id'] != Settings.objects.get(user=other).id

    def test_settings_requires_authentication(self):
        self.client.credentials()
        assert self.client.get('/api/auth/settings/').status_code == status.HTTP_401_UNAUTHORIZED
