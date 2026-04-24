"""
pytest configuration and fixtures for the wedding backend application.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from django.test import TestCase
from django.urls import reverse
from factory_boy import Faker
from factory.django import DjangoModelFactory

User = get_user_model()


@pytest.fixture
def api_client():
    """Return an APIClient instance for testing API endpoints."""
    return APIClient()


@pytest.fixture
def authenticated_client(api_client, user):
    """Return an authenticated APIClient instance."""
    token, created = Token.objects.get_or_create(user=user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return api_client


@pytest.fixture
def user(db):
    """Create a test user."""
    return UserFactory()


@pytest.fixture
def admin_user(db):
    """Create an admin user."""
    return UserFactory(is_staff=True, is_superuser=True)


@pytest.fixture
def authenticated_admin_client(api_client, admin_user):
    """Return an authenticated admin client."""
    token, created = Token.objects.get_or_create(user=admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return api_client


@pytest.fixture
def sample_wedding(user):
    """Create a sample wedding for testing."""
    from tests.factories import WeddingFactory
    return WeddingFactory(user=user)


@pytest.mark.django_db
class BaseTestCase(TestCase):
    """Base test case with common setup methods."""
    
    def setUp(self):
        self.client = APIClient()
        from tests.factories import UserFactory
        self.user = UserFactory()
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
    
    def authenticate(self, user):
        """Authenticate the client with the given user."""
        token, created = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    
    def get_response_data(self, response):
        """Extract data from API response."""
        return response.json().get('data', {})
    
    def assert_success_response(self, response, expected_status=200):
        """Assert that the response is successful."""
        assert response.status_code == expected_status
        data = response.json()
        assert data['success'] is True
        assert 'data' in data
        assert data['errors'] == []
    
    def assert_error_response(self, response, expected_status=400):
        """Assert that the response contains an error."""
        assert response.status_code == expected_status
        data = response.json()
        assert data['success'] is False
        assert data['data'] == {}
        assert 'errors' in data
