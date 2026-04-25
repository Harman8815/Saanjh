"""
Comprehensive tests for the accounts module API endpoints.
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

from tests.factories import UserFactory, RoleFactory, SettingsFactory
from tests.conftest import BaseTestCase

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistration(BaseTestCase):
    """Test user registration endpoint."""
    
    def test_user_registration_success(self):
        """Test successful user registration."""
        data = {
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        
        response = self.client.post('/api/auth/register/', data)
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "User registered successfully"
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
            'email': 'invalid-email',
            'first_name': '',
            'password': '123',
            'password_confirm': '456'
        }
        
        response = self.client.post('/api/auth/register/', data)
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
        response_data = response.json()
        assert response_data['success'] is False
        assert len(response_data['errors']) > 0
    
    def test_user_registration_duplicate_email(self):
        """Test user registration with duplicate email."""
        UserFactory(email='test@example.com')
        
        data = {
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        
        response = self.client.post('/api/auth/register/', data)
        
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
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post('/api/auth/login/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Login successful"
        assert 'user' in response_data['data']
        assert 'token' in response_data['data']
    
    def test_user_login_invalid_credentials(self):
        """Test user login with invalid credentials."""
        UserFactory(email='test@example.com')
        
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post('/api/auth/login/', data)
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
    
    def test_user_login_nonexistent_user(self):
        """Test user login with nonexistent user."""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post('/api/auth/login/', data)
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)


@pytest.mark.django_db
class TestUserLogout(BaseTestCase):
    """Test user logout endpoint."""
    
    def test_user_logout_success(self):
        """Test successful user logout."""
        response = self.client.post('/api/auth/logout/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Successfully logged out"
        
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
        
        response = self.client.patch('/api/auth/profile/', data)
        
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
        
        response = self.client.patch('/api/auth/profile/', data)
        
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
        assert response_data['message'] == "Statistics retrieved successfully"
        stats = response_data['data']
        assert stats['guest_count'] == 5
        assert stats['has_wedding'] is True
        assert 'expense_total' in stats
    
    def test_get_user_stats_without_wedding(self):
        """Test getting user stats without wedding."""
        response = self.client.get('/api/auth/stats/')
        
        self.assert_success_response(response)
        response_data = response.json()
        stats = response_data['data']
        assert stats['guest_count'] == 0
        assert stats['has_wedding'] is False
    
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
            'email_notifications': False
        }
        
        response = self.client.post('/api/auth/settings/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Settings updated successfully"
        assert response_data['data']['theme'] == 'dark'
        assert response_data['data']['language'] == 'es'
        assert response_data['data']['email_notifications'] is False
    
    def test_update_settings_invalid_data(self):
        """Test updating settings with invalid data."""
        data = {
            'theme': 'invalid_theme'
        }
        
        response = self.client.post('/api/auth/settings/', data)
        
        self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
    
    def test_get_settings_unauthenticated(self):
        """Test getting settings without authentication."""
        self.client.credentials()  # Remove authentication
        
        response = self.client.get('/api/auth/settings/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestRoleViewSet(BaseTestCase):
    """Test Role ViewSet endpoints."""
    
    def setUp(self):
        super().setUp()
        self.admin_user = UserFactory(is_staff=True, is_superuser=True)
        admin_token = Token.objects.create(user=self.admin_user)
        self.admin_client = APIClient()
        self.admin_client.credentials(HTTP_AUTHORIZATION=f'Token {admin_token.key}')
    
    def test_list_roles_success(self):
        """Test listing roles."""
        RoleFactory.create_batch(3)
        
        response = self.client.get('/api/auth/roles/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Roles retrieved successfully"
        assert len(response_data['data']) == 3
    
    def test_create_role_success(self):
        """Test creating a role."""
        data = {
            'name': 'Test Role',
            'description': 'Test description',
            'permissions': {'can_edit': True}
        }
        
        response = self.admin_client.post('/api/auth/roles/', data)
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "Role created successfully"
        assert response_data['data']['name'] == 'Test Role'
    
    def test_retrieve_role_success(self):
        """Test retrieving a specific role."""
        role = RoleFactory()
        
        response = self.client.get(f'/api/auth/roles/{role.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Role retrieved successfully"
        assert response_data['data']['id'] == role.id
    
    def test_update_role_success(self):
        """Test updating a role."""
        role = RoleFactory()
        data = {
            'name': 'Updated Role',
            'description': 'Updated description'
        }
        
        response = self.admin_client.patch(f'/api/auth/roles/{role.id}/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Role updated successfully"
        assert response_data['data']['name'] == 'Updated Role'
    
    def test_delete_role_success(self):
        """Test deleting a role."""
        role = RoleFactory()
        
        response = self.admin_client.delete(f'/api/auth/roles/{role.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Role deleted successfully"
        
        # Verify role was deleted
        assert not Role.objects.filter(id=role.id).exists()
    
    def test_create_role_unauthorized(self):
        """Test creating role without admin permissions."""
        data = {
            'name': 'Test Role',
            'description': 'Test description'
        }
        
        response = self.client.post('/api/auth/roles/', data)
        
        assert response.status_code == status.HTTP_403_FORbidden


@pytest.mark.django_db
class TestSettingsViewSet(BaseTestCase):
    """Test Settings ViewSet endpoints."""
    
    def test_list_settings_success(self):
        """Test listing user settings."""
        SettingsFactory.create_batch(3, user=self.user)
        
        response = self.client.get('/api/auth/settings-viewset/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Settings retrieved successfully"
        assert len(response_data['data']) == 3
    
    def test_create_settings_success(self):
        """Test creating settings."""
        data = {
            'theme': 'light',
            'language': 'en',
            'email_notifications': True
        }
        
        response = self.client.post('/api/auth/settings-viewset/', data)
        
        self.assert_success_response(response, status.HTTP_201_CREATED)
        response_data = response.json()
        assert response_data['message'] == "Settings created successfully"
        assert response_data['data']['theme'] == 'light'
    
    def test_retrieve_settings_success(self):
        """Test retrieving specific settings."""
        settings = SettingsFactory(user=self.user)
        
        response = self.client.get(f'/api/auth/settings-viewset/{settings.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Settings retrieved successfully"
        assert response_data['data']['id'] == settings.id
    
    def test_update_settings_success(self):
        """Test updating settings."""
        settings = SettingsFactory(user=self.user)
        data = {
            'theme': 'dark',
            'language': 'es'
        }
        
        response = self.client.patch(f'/api/auth/settings-viewset/{settings.id}/', data)
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Settings updated successfully"
        assert response_data['data']['theme'] == 'dark'
    
    def test_delete_settings_success(self):
        """Test deleting settings."""
        settings = SettingsFactory(user=self.user)
        
        response = self.client.delete(f'/api/auth/settings-viewset/{settings.id}/')
        
        self.assert_success_response(response)
        response_data = response.json()
        assert response_data['message'] == "Settings deleted successfully"
        
        # Verify settings were deleted
        assert not Settings.objects.filter(id=settings.id).exists()
    
    def test_other_user_settings_inaccessible(self):
        """Test that user cannot access another user's settings."""
        other_user = UserFactory()
        other_settings = SettingsFactory(user=other_user)
        
        response = self.client.get(f'/api/auth/settings-viewset/{other_settings.id}/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
