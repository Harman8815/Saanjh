# Testing Suite Documentation

This directory contains the comprehensive test suite for the wedding backend application.

## Structure

```
tests/
├── conftest.py              # Global pytest configuration and fixtures
├── factories/               # Factory Boy test data factories
│   ├── __init__.py
│   ├── accounts.py         # User, Role, Settings factories
│   ├── expenses.py         # Expense, BudgetCategory, ExpenseStatus factories
│   ├── guests.py           # Guest, RSVP, Table, Meal factories
│   └── weddings.py         # Wedding factory
└── api/                    # API endpoint tests
    ├── test_accounts.py     # Accounts module tests
    ├── test_expenses.py     # Expenses module tests
    └── test_guests.py       # Guests module tests
```

## Running Tests

### Run all tests
```bash
pytest
```

### Run with coverage
```bash
pytest --cov=accounts --cov=expenses --cov=guests --cov=utils --cov-report=html
```

### Run specific module tests
```bash
pytest tests/api/test_accounts.py
pytest tests/api/test_expenses.py
pytest tests/api/test_guests.py
```

### Run with markers
```bash
pytest -m unit          # Run unit tests only
pytest -m integration   # Run integration tests only
pytest -m auth          # Run authentication tests only
pytest -m crud          # Run CRUD operation tests only
```

## Test Standards

### API Response Format
All API endpoints must return responses in the standard format:

```json
{
  "success": true | false,
  "data": {},
  "message": "optional",
  "errors": []
}
```

### Test Coverage Requirements
- **Success cases**: All happy path scenarios
- **Validation errors**: Invalid input handling
- **Authentication cases**: Authenticated vs unauthenticated access
- **Authorization cases**: User permission boundaries
- **Edge cases**: Boundary conditions and error scenarios

### Test Data Generation
- Use factory_boy for all test data
- No hardcoded test data
- Realistic and varied test scenarios
- Isolated test execution

## Fixtures

### Base Fixtures
- `api_client`: Unauthenticated DRF APIClient
- `authenticated_client`: Authenticated APIClient with token
- `admin_user`: User with staff and superuser permissions
- `sample_wedding`: Wedding instance for testing

### BaseTestCase
All test classes should inherit from `BaseTestCase` which provides:
- Standard setup methods
- Common assertion helpers
- Authentication utilities
- Response data extraction methods

## Factory Usage

### Creating Test Objects
```python
from tests.factories import UserFactory, WeddingFactory, GuestFactory

# Single object
user = UserFactory()

# Multiple objects
guests = GuestFactory.create_batch(5)

# With relationships
wedding = WeddingFactory(user=user)
guest = GuestFactory(wedding=wedding)
```

### Factory Features
- Automatic relationship handling
- Realistic data generation with Faker
- Customizable attributes
- Post-generation hooks

## API Testing Patterns

### Success Response Testing
```python
def test_endpoint_success(self):
    response = self.client.post('/api/endpoint/', data)
    self.assert_success_response(response, status.HTTP_201_CREATED)
    response_data = response.json()
    assert response_data['message'] == "Resource created successfully"
```

### Error Response Testing
```python
def test_endpoint_error(self):
    response = self.client.post('/api/endpoint/', invalid_data)
    self.assert_error_response(response, status.HTTP_400_BAD_REQUEST)
    response_data = response.json()
    assert response_data['success'] is False
    assert len(response_data['errors']) > 0
```

### Authentication Testing
```python
def test_unauthenticated_access(self):
    self.client.credentials()  # Remove auth
    response = self.client.get('/api/protected-endpoint/')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
```

## Coverage Requirements

Target coverage: **80%** minimum for all modules.

Coverage is automatically checked in CI and will fail if below threshold.

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Test method names should clearly describe what's being tested
3. **Arrange-Act-Assert**: Structure tests in this pattern
4. **Factory Usage**: Always use factories for test data
5. **Error Testing**: Test both success and failure scenarios
6. **Authentication**: Test both authenticated and unauthenticated scenarios
7. **Authorization**: Test user permission boundaries

## Continuous Integration

The test suite runs automatically on:
- Pull requests
- Main branch commits
- Scheduled runs

Tests must pass before any code can be merged.
