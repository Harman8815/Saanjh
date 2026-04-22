# Usage Notes and Best Practices

## API Usage Guidelines

### Authentication

**Token Management**:
- Store tokens securely on client side
- Implement token refresh mechanism
- Handle token expiration gracefully
- Use HTTPS in production to protect tokens

**User Flow**:
1. Register new user account
2. Login to receive authentication token
3. Include token in all subsequent API requests
4. Logout to invalidate token when done

### Request Patterns

**Standard CRUD Operations**:
```javascript
// List with filtering
GET /api/guests/?rsvp_status=confirmed&search=john

// Create single record
POST /api/guests/
{
  "name": "John Doe",
  "email": "john@example.com"
}

// Bulk operations
POST /api/guests/bulk/
{
  "guests": [
    {"name": "Guest 1"},
    {"name": "Guest 2"}
  ]
}

// Update record
PATCH /api/guests/1/
{
  "rsvp_status": "confirmed"
}
```

**Error Handling**:
```javascript
try {
  const response = await fetch('/api/guests/', {
    headers: { 'Authorization': `Token ${token}` }
  });
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
  }
  return response.json();
} catch (error) {
  console.error('Network Error:', error);
}
```

### Performance Optimization

**Pagination**:
```javascript
// Use pagination for large datasets
GET /api/guests/?page=1&page_size=20

// Response includes pagination info
{
  "count": 150,
  "next": "http://localhost:8000/api/guests/?page=2",
  "previous": null,
  "results": [...]
}
```

**Bulk Operations**:
- Use bulk create for importing guest lists
- Use bulk updates for changing multiple RSVPs
- Use bulk status updates for vendor management

**Caching Strategy**:
```javascript
// Cache wedding details (changes infrequently)
const weddingData = await fetch('/api/weddings/');
localStorage.setItem('wedding', JSON.stringify(weddingData));

// Cache user profile (changes occasionally)
const userProfile = await fetch('/api/auth/profile/');
sessionStorage.setItem('profile', JSON.stringify(userProfile));
```

### Data Synchronization

**Real-time Updates**:
```javascript
// Poll for dashboard updates
setInterval(async () => {
  const dashboard = await fetch('/api/weddings/dashboard/');
  updateDashboardUI(dashboard);
}, 30000); // Every 30 seconds
```

**Optimistic Updates**:
```javascript
// Update UI immediately, then sync with server
function updateGuestRSVP(guestId, status) {
  // Update UI immediately
  updateGuestInUI(guestId, { rsvp_status: status });
  
  // Then sync with server
  fetch(`/api/guests/${guestId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ rsvp_status: status })
  }).catch(error => {
    // Revert UI if server update fails
    revertGuestInUI(guestId);
  });
}
```

## Frontend Integration Examples

### React Integration

**API Service Setup**:
```javascript
// services/api.js
class APIService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Token ${this.token}` })
      },
      ...options
    };

    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }

  // Authentication
  async login(credentials) {
    const data = await this.request('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    this.token = data.token;
    localStorage.setItem('authToken', this.token);
    return data;
  }

  // Wedding Management
  async getWedding() {
    return this.request('/api/weddings/');
  }

  async updateWedding(weddingData) {
    return this.request('/api/weddings/', {
      method: 'PATCH',
      body: JSON.stringify(weddingData)
    });
  }

  // Guest Management
  async getGuests(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return this.request(`/api/guests/?${queryString}`);
  }

  async createGuest(guestData) {
    return this.request('/api/guests/', {
      method: 'POST',
      body: JSON.stringify(guestData)
    });
  }

  async bulkCreateGuests(guests) {
    return this.request('/api/guests/bulk/', {
      method: 'POST',
      body: JSON.stringify({ guests })
    });
  }
}

export default new APIService('http://localhost:8000/api');
```

**React Component Example**:
```javascript
// components/GuestList.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

function GuestList() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadGuests();
  }, [filters]);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const data = await api.getGuests(filters);
      setGuests(data.results);
    } catch (error) {
      console.error('Failed to load guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVPUpdate = async (guestId, status) => {
    try {
      await api.request(`/api/guests/${guestId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ rsvp_status: status })
      });
      loadGuests(); // Refresh list
    } catch (error) {
      console.error('Failed to update RSVP:', error);
    }
  };

  if (loading) return <div>Loading guests...</div>;

  return (
    <div>
      <h2>Guest List</h2>
      {guests.map(guest => (
        <div key={guest.id}>
          <span>{guest.name}</span>
          <select 
            value={guest.rsvp_status}
            onChange={(e) => handleRSVPUpdate(guest.id, e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      ))}
    </div>
  );
}
```

### Vue.js Integration

**API Composable**:
```javascript
// composables/useAPI.js
import { ref } from 'vue';
import api from '../services/api';

export function useAPI() {
  const loading = ref(false);
  const error = ref(null);

  const request = async (endpoint, options = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await api.request(endpoint, options);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { request, loading, error };
}
```

**Vue Component Example**:
```javascript
// components/WeddingDashboard.vue
<template>
  <div>
    <h1>Wedding Dashboard</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <div class="stats">
        <div class="stat">
          <h3>Guests</h3>
          <p>{{ dashboard.guest_stats?.confirmed || 0 }} Confirmed</p>
          <p>{{ dashboard.guest_stats?.total || 0 }} Total</p>
        </div>
        <div class="stat">
          <h3>Budget</h3>
          <p>{{ dashboard.expense_stats?.budget_used || 0 }}% Used</p>
          <p>${{ dashboard.expense_stats?.total_actual || 0 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAPI } from '../composables/useAPI';

const { request, loading, error } = useAPI();
const dashboard = ref({});

onMounted(async () => {
  try {
    dashboard.value = await request('/api/weddings/dashboard/');
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
});
</script>
```

## Data Import/Export

### Guest List Import

**CSV Format**:
```csv
name,email,phone,relationship,dietary_restrictions,notes
John Doe,john@example.com,+1234567890,friend,Vegetarian,College friend
Jane Smith,jane@example.com,,family,,Cousin
```

**Import Function**:
```javascript
async function importGuests(csvData) {
  const guests = csvData.split('\n')
    .filter(line => line.trim())
    .map(line => {
      const [name, email, phone, relationship, dietary, notes] = line.split(',');
      return { name, email, phone, relationship, dietary_restrictions: dietary, notes };
    });

  try {
    const result = await api.bulkCreateGuests(guests);
    console.log(`Imported ${result.length} guests`);
    return result;
  } catch (error) {
    console.error('Import failed:', error);
  }
}
```

### Data Export

**Export Guests**:
```javascript
async function exportGuests() {
  try {
    const guests = await api.request('/api/guests/export/');
    
    // Convert to CSV
    const headers = ['name', 'email', 'rsvp_status', 'relationship'];
    const csv = [
      headers.join(','),
      ...guests.map(guest => 
        headers.map(header => guest[header] || '').join(',')
      )
    ].join('\n');
    
    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guests.csv';
    a.click();
  } catch (error) {
    console.error('Export failed:', error);
  }
}
```

## Wedding Card Integration

### Public Card Access

**Embedding Card**:
```html
<!-- Embed in external website -->
<iframe 
  src="http://localhost:8000/api/public/cards/abc123/"
  width="800" 
  height="600"
  frameborder="0">
</iframe>
```

**Custom RSVP Form**:
```javascript
async function submitRSVP(shareableLink, rsvpData) {
  try {
    const response = await fetch(`/api/public/cards/${shareableLink}/rsvp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rsvpData)
    });
    
    if (response.ok) {
      alert('RSVP submitted successfully!');
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    alert('Network error. Please try again.');
  }
}
```

### Photo Upload

**Client-side Upload**:
```javascript
async function uploadPhoto(cardId, guestId, file) {
  const formData = new FormData();
  formData.append('photo', file);
  
  try {
    // First upload to file storage service
    const uploadResponse = await fetch('/api/upload/', {
      method: 'POST',
      body: formData
    });
    const { photo_url } = await uploadResponse.json();
    
    // Then update wedding card guest
    await api.request(`/api/wedding-cards/${cardId}/guests/${guestId}/upload-photo/`, {
      method: 'POST',
      body: JSON.stringify({ photo_url })
    });
    
    alert('Photo uploaded successfully!');
  } catch (error) {
    alert('Upload failed. Please try again.');
  }
}
```

## Error Handling Best Practices

### API Error Types

**Validation Errors** (400):
```javascript
if (response.status === 400) {
  const errors = await response.json();
  // Handle field-specific errors
  Object.keys(errors).forEach(field => {
    showFieldError(field, errors[field]);
  });
}
```

**Authentication Errors** (401):
```javascript
if (response.status === 401) {
  // Clear stored token and redirect to login
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}
```

**Not Found Errors** (404):
```javascript
if (response.status === 404) {
  showUserError('The requested resource was not found.');
}
```

### Network Error Handling

**Retry Logic**:
```javascript
async function apiRequestWithRetry(endpoint, options = {}, retries = 3) {
  try {
    return await api.request(endpoint, options);
  } catch (error) {
    if (retries > 0 && error.name === 'NetworkError') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiRequestWithRetry(endpoint, options, retries - 1);
    }
    throw error;
  }
}
```

## Testing Strategies

### Unit Testing API Calls

**Jest Example**:
```javascript
// __tests__/api.test.js
import api from '../services/api';

// Mock fetch
global.fetch = jest.fn();

test('login returns token', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({
      user: { id: 1, username: 'test' },
      token: 'abc123'
    })
  });

  const result = await api.login({ username: 'test', password: 'pass' });
  
  expect(result.token).toBe('abc123');
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/auth/login/'),
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ username: 'test', password: 'pass' })
    })
  );
});
```

### Integration Testing

**Cypress Example**:
```javascript
// cypress/integration/wedding-planning.spec.js
describe('Wedding Planning', () => {
  beforeEach(() => {
    // Login before each test
    cy.request('POST', '/api/auth/login/', {
      username: 'test@example.com',
      password: 'password'
    }).then(({ body }) => {
      window.localStorage.setItem('authToken', body.token);
    });
  });

  it('should create and manage guests', () => {
    cy.visit('/dashboard');
    
    // Add guest
    cy.get('[data-testid=add-guest-btn]').click();
    cy.get('[data-testid=guest-name]').type('John Doe');
    cy.get('[data-testid=guest-email]').type('john@example.com');
    cy.get('[data-testid=save-guest]').click();
    
    // Verify guest appears in list
    cy.contains('John Doe').should('be.visible');
    
    // Update RSVP
    cy.get('[data-testid=rsvp-select]').select('confirmed');
    cy.contains('RSVP updated').should('be.visible');
  });
});
```

## Deployment Considerations

### Environment Variables

**Production Settings**:
```bash
# .env
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost/wedding_db
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### Security Headers

**Middleware Configuration**:
```python
# settings.py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
```

### Performance Monitoring

**Logging Setup**:
```python
# settings.py
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'wedding_api.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## Troubleshooting

### Common Issues

**CORS Errors**:
- Ensure frontend URL is in CORS_ALLOWED_ORIGINS
- Check that requests include proper headers
- Verify API base URL is correct

**Authentication Issues**:
- Check token format (should be "Token <token>")
- Verify token hasn't expired
- Ensure user is active

**Performance Issues**:
- Use pagination for large datasets
- Implement caching for static data
- Optimize database queries with select_related/prefetch_related

**Data Validation Errors**:
- Check required fields in request body
- Verify data types match expected formats
- Review API documentation for field constraints

### Debug Mode

**Enable Debug Logging**:
```python
# settings.py
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'wedding_backend': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

**Database Query Inspection**:
```python
# views.py
from django.db import connection

def debug_queries(view_func):
    def wrapper(*args, **kwargs):
        result = view_func(*args, **kwargs)
        print(connection.queries)  # Show all queries
        return result
    return wrapper
```
