"""
Basic test to verify Django setup and CRUD operations.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class BasicCRUDTest(TestCase):
    """Test basic CRUD operations without factory_boy."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
    def test_user_creation(self):
        """Test user creation (CREATE operation)."""
        from accounts.models import Role
        role = Role.objects.first()  # Get existing role or create one
        
        user_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'New',
            'last_name': 'User',
            'role_id': role.id if role else 1
        }
        
        response = self.client.post('/api/auth/register/', user_data)
        
        # Check if user was created
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())
        
    def test_user_login(self):
        """Test user login (READ operation)."""
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = self.client.post('/api/auth/login/', login_data)
        
        # Check if login was successful
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.json().get('data', {}))
        
    def test_user_profile_update(self):
        """Test user profile update (UPDATE operation)."""
        # First login
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', login_data)
        token = response.json().get('data', {}).get('token')
        
        # Set authentication
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        
        # Update profile
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        response = self.client.patch('/api/auth/profile/', update_data)
        
        # Check if update was successful
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        
    def test_user_logout(self):
        """Test user logout (DELETE operation for token)."""
        # First login
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', login_data)
        token = response.json().get('data', {}).get('token')
        
        # Set authentication
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        
        # Logout
        response = self.client.post('/api/auth/logout/')
        
        # Check if logout was successful
        self.assertEqual(response.status_code, 200)
        
    def test_api_response_format(self):
        """Test that all responses follow the standard format."""
        # Test successful response
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        
        response_data = response.json()
        
        # Check standard response format
        self.assertIn('success', response_data)
        self.assertIn('data', response_data)
        self.assertIn('message', response_data)
        self.assertIn('errors', response_data)
        
        # For successful response
        self.assertTrue(response_data['success'])
        self.assertIsInstance(response_data['data'], dict)
        self.assertEqual(response_data['errors'], [])
        
    def test_error_response_format(self):
        """Test that error responses follow the standard format."""
        # Test error response
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'wrongpassword'
        })
        
        response_data = response.json()
        
        # Check if it's a standard API response or Django REST framework error
        if 'success' in response_data:
            # Standard API response format
            self.assertIn('data', response_data)
            self.assertIn('message', response_data)
            self.assertIn('errors', response_data)
            
            # For error response
            self.assertFalse(response_data['success'])
            self.assertIsInstance(response_data['errors'], list)
            self.assertGreater(len(response_data['errors']), 0)
        else:
            # Django REST framework error format
            self.assertIn('non_field_errors', response_data)
            self.assertIsInstance(response_data['non_field_errors'], list)
            self.assertGreater(len(response_data['non_field_errors']), 0)
