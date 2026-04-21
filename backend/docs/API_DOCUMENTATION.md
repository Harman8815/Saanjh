# Wedding Proposal Generator - API Documentation

## Overview

This Django REST Framework backend provides comprehensive APIs for wedding planning management, including user accounts, wedding details, guest management, vendor tracking, expense monitoring, and digital wedding cards.

## Base URL

```
http://localhost:8000/api/
```

## Authentication

The API uses Token Authentication. Include the token in the Authorization header:

```
Authorization: Token your_auth_token_here
```

## API Endpoints

### Authentication (`/api/auth/`)

#### Register User
- **POST** `/api/auth/register/`
- **Description**: Register a new user account
- **Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "password": "secure_password",
  "password_confirm": "secure_password"
}
```
- **Response**:
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "subscription_tier": "free"
  },
  "token": "a1b2c3d4e5f6g7h8i9j0"
}
```

#### Login
- **POST** `/api/auth/login/`
- **Description**: Authenticate user and get token
- **Request Body**:
```json
{
  "username": "john_doe",
  "password": "secure_password"
}
```
- **Response**: Same as register response

#### Logout
- **POST** `/api/auth/logout/`
- **Description**: Logout user and invalidate token
- **Headers**: Authorization token required

#### Get/Update Profile
- **GET** `/api/auth/profile/`
- **PUT/PATCH** `/api/auth/profile/`
- **Description**: Get or update user profile
- **Headers**: Authorization token required

#### User Statistics
- **GET** `/api/auth/stats/`
- **Description**: Get user's wedding statistics
- **Response**:
```json
{
  "guest_count": 45,
  "vendor_count": 8,
  "expense_total": 6500.00,
  "days_until_wedding": 120,
  "has_wedding": true
}
```

### Wedding Management (`/api/weddings/`)

#### Get Wedding Details
- **GET** `/api/weddings/`
- **Description**: Get current user's wedding details
- **Response**:
```json
{
  "id": 1,
  "bride_name": "Sarah",
  "groom_name": "Michael",
  "couple_names": "Sarah & Michael",
  "wedding_date": "2024-08-15",
  "venue": "Grand Ballroom",
  "guest_count": 100,
  "budget": 20000.00,
  "status": "planning",
  "days_until_wedding": 120
}
```

#### Create Wedding
- **POST** `/api/weddings/create/`
- **Description**: Create wedding profile
- **Request Body**:
```json
{
  "bride_name": "Sarah",
  "groom_name": "Michael",
  "wedding_date": "2024-08-15",
  "venue": "Grand Ballroom",
  "guest_count": 100,
  "budget": 20000.00
}
```

#### Update Wedding
- **PUT/PATCH** `/api/weddings/`
- **Description**: Update wedding details

#### Wedding Dashboard
- **GET** `/api/weddings/dashboard/`
- **Description**: Get comprehensive dashboard data
- **Response**:
```json
{
  "wedding": { /* wedding details */ },
  "guest_stats": {
    "total": 45,
    "confirmed": 30,
    "pending": 10,
    "declined": 5
  },
  "vendor_stats": {
    "total": 8,
    "confirmed": 5,
    "pending": 2,
    "contacted": 1
  },
  "expense_stats": {
    "total_estimated": 18000.00,
    "total_actual": 16500.00,
    "total_paid": 12000.00,
    "budget_used": 82.5
  },
  "recent_activities": {
    "guests": [/* recent guest activities */],
    "expenses": [/* recent expense activities */],
    "vendors": [/* recent vendor activities */]
  }
}
```

#### Wedding Timeline
- **GET** `/api/weddings/timeline/`
- **Description**: Get wedding timeline events
- **Response**:
```json
[
  {
    "event": "Guest Emma Johnson added",
    "description": "Emma Johnson was added to the guest list",
    "date": "2024-01-15T10:30:00Z",
    "type": "guest"
  }
]
```

### Guest Management (`/api/guests/`)

#### List Guests
- **GET** `/api/guests/`
- **Description**: Get all guests with filtering and search
- **Query Parameters**:
  - `rsvp_status`: Filter by RSVP status
  - `relationship`: Filter by relationship type
  - `search`: Search by name, email, or phone
  - `ordering`: Sort by field (name, added_date, rsvp_status)

#### Create Guest
- **POST** `/api/guests/`
- **Request Body**:
```json
{
  "name": "Emma Johnson",
  "email": "emma@example.com",
  "phone": "+1234567890",
  "relationship": "friend",
  "address": "123 Main St, City, State",
  "dietary_restrictions": "Vegetarian",
  "notes": "College friend",
  "plus_one": true,
  "plus_one_name": "Guest name"
}
```

#### Bulk Create Guests
- **POST** `/api/guests/bulk/`
- **Request Body**:
```json
{
  "guests": [
    { /* guest object */ },
    { /* guest object */ }
  ]
}
```

#### Guest Details
- **GET** `/api/guests/{id}/`
- **PUT/PATCH** `/api/guests/{id}/`
- **DELETE** `/api/guests/{id}/`

#### Bulk RSVP Update
- **POST** `/api/guests/bulk-rsvp-update/`
- **Request Body**:
```json
{
  "guest_ids": [1, 2, 3],
  "rsvp_status": "confirmed",
  "rsvp_date": "2024-02-01"
}
```

#### Send Invitations
- **POST** `/api/guests/send-invitations/`
- **Request Body**:
```json
{
  "guest_ids": [1, 2, 3]
}
```

#### Guest Statistics
- **GET** `/api/guests/statistics/`
- **Response**:
```json
{
  "total": 45,
  "confirmed": 30,
  "pending": 10,
  "declined": 5,
  "with_plus_one": 15,
  "invitations_sent": 40,
  "rsvp_rate": 66.67,
  "expected_attendees": 45
}
```

#### Export Guests
- **GET** `/api/guests/export/`
- **Description**: Export all guest data

### Vendor Management (`/api/vendors/`)

#### List Vendors
- **GET** `/api/vendors/`
- **Query Parameters**:
  - `vendor_type`: Filter by vendor type
  - `status`: Filter by status
  - `search`: Search by name, contact person, email

#### Create Vendor
- **POST** `/api/vendors/`
- **Request Body**:
```json
{
  "name": "Grand Ballroom",
  "vendor_type": "venue",
  "contact_person": "John Smith",
  "email": "info@grandballroom.com",
  "phone": "+1234567890",
  "website": "https://grandballroom.com",
  "address": "123 Event Ave, City, State",
  "cost": 5000.00,
  "deposit_paid": 1000.00,
  "booking_date": "2024-01-15",
  "contract_signed": true,
  "services_provided": "Full venue rental with catering",
  "notes": "Preferred vendor"
}
```

#### Vendor Details
- **GET** `/api/vendors/{id}/`
- **PUT/PATCH** `/api/vendors/{id}/`
- **DELETE** `/api/vendors/{id}/`

#### Bulk Status Update
- **POST** `/api/vendors/bulk-status-update/`
- **Request Body**:
```json
{
  "vendor_ids": [1, 2, 3],
  "status": "confirmed"
}
```

#### Vendor Statistics
- **GET** `/api/vendors/statistics/`
- **Response**:
```json
{
  "total": 8,
  "pending": 2,
  "contacted": 1,
  "confirmed": 5,
  "completed": 0,
  "cancelled": 0,
  "by_type": {
    "Venue": 1,
    "Photography": 1,
    "Catering": 1
  },
  "total_cost": 15000.00,
  "total_deposits": 3000.00,
  "remaining_balance": 12000.00
}
```

#### Follow-up Reminders
- **GET** `/api/vendors/follow-ups/`
- **Description**: Get vendors needing follow-up

#### Mark as Contacted
- **POST** `/api/vendors/{id}/mark-contacted/`
- **Description**: Update contact date and set next follow-up

### Expense Management (`/api/expenses/`)

#### List Expenses
- **GET** `/api/expenses/`
- **Query Parameters**:
  - `category`: Filter by category
  - `payment_status`: Filter by payment status
  - `vendor`: Filter by vendor
  - `search`: Search by description or notes

#### Create Expense
- **POST** `/api/expenses/`
- **Request Body**:
```json
{
  "description": "Venue deposit",
  "category": "venue",
  "estimated_cost": 5000.00,
  "actual_cost": 4800.00,
  "vendor": 1,
  "expense_date": "2024-01-15",
  "due_date": "2024-02-15",
  "notes": "Initial venue deposit",
  "receipt_url": "https://example.com/receipt.pdf"
}
```

#### Expense Details
- **GET** `/api/expenses/{id}/`
- **PUT/PATCH** `/api/expenses/{id}/`
- **DELETE** `/api/expenses/{id}/`

#### Bulk Payment Update
- **POST** `/api/expenses/bulk-payment-update/`
- **Request Body**:
```json
{
  "expense_ids": [1, 2, 3],
  "payment_status": "paid",
  "paid_date": "2024-02-01"
}
```

#### Expense Statistics
- **GET** `/api/expenses/statistics/`
- **Response**:
```json
{
  "total_expenses": 15,
  "total_estimated": 18000.00,
  "total_actual": 16500.00,
  "total_paid": 12000.00,
  "remaining_balance": 4500.00,
  "budget": 20000.00,
  "budget_used": 82.5,
  "budget_remaining": 3500.00,
  "by_payment_status": {
    "Paid": 8,
    "Pending": 5,
    "Partial": 2
  },
  "by_category": {
    "Venue": {
      "count": 1,
      "estimated": 5000.00,
      "actual": 4800.00,
      "paid": 4000.00
    }
  },
  "overdue_count": 2
}
```

#### Overdue Expenses
- **GET** `/api/expenses/overdue/`
- **Description**: Get overdue expenses

#### Upcoming Expenses
- **GET** `/api/expenses/upcoming/`
- **Description**: Get expenses due in next 30 days

#### Expense Summary
- **GET** `/api/expenses/summary/`
- **Description**: Get dashboard summary data

### Wedding Cards (`/api/wedding-cards/`)

#### List Wedding Cards
- **GET** `/api/wedding-cards/`
- **Description**: Get user's wedding cards

#### Create Wedding Card
- **POST** `/api/wedding-cards/`
- **Request Body**:
```json
{
  "template": 1,
  "couple_names": "Sarah & Michael",
  "wedding_details": "Join us as we celebrate our love...",
  "primary_color": "#8B5CF6",
  "font_style": "elegant",
  "photos": ["https://example.com/photo1.jpg"],
  "allow_guest_photos": true,
  "require_rsvp": true,
  "send_reminders": true
}
```

#### Wedding Card Details
- **GET** `/api/wedding-cards/{id}/`
- **PUT/PATCH** `/api/wedding-cards/{id}/`
- **DELETE** `/api/wedding-cards/{id}/`

#### Wedding Card Guests
- **GET** `/api/wedding-cards/{card_id}/guests/`
- **POST** `/api/wedding-cards/{card_id}/guests/`
- **Description**: Manage card guests

#### Wedding Card Analytics
- **GET** `/api/wedding-cards/{card_id}/analytics/`
- **Response**:
```json
{
  "id": 1,
  "total_views": 156,
  "unique_views": 120,
  "total_rsvps": 89,
  "confirmed_rsvps": 67,
  "declined_rsvps": 22,
  "total_photos_uploaded": 15,
  "rsvp_rate": 75.28
}
```

#### Upload Guest Photo
- **POST** `/api/wedding-cards/{card_id}/guests/{guest_id}/upload-photo/`
- **Request Body**:
```json
{
  "photo_url": "https://example.com/uploaded_photo.jpg"
}
```

#### Export Card Guests
- **GET** `/api/wedding-cards/{card_id}/export/`
- **Description**: Export card guest data

### Public Endpoints

#### View Wedding Card
- **GET** `/api/public/cards/{shareable_link}/`
- **Description**: Public endpoint to view wedding card
- **No authentication required**

#### Public RSVP
- **POST** `/api/public/cards/{shareable_link}/rsvp/`
- **Description**: Public endpoint for guests to RSVP
- **Request Body**:
```json
{
  "name": "Guest Name",
  "email": "guest@example.com",
  "rsvp_status": "confirmed",
  "plus_one": false,
  "dietary_restrictions": "None",
  "notes": "Looking forward to it!"
}
```

### Admin Fake Data Generation (`/api/admin/`)

**Note**: All admin endpoints require admin privileges and authentication.

#### Generate Complete Fake Dataset
- **POST** `/api/admin/generate-fake-data/`
- **Description**: Generate a complete fake dataset with multiple users, weddings, guests, vendors, expenses, and wedding cards
- **Request Body**:
```json
{
  "user_count": 3,
  "guests_per_wedding": 30,
  "vendors_per_wedding": 8,
  "expenses_per_wedding": 15
}
```
- **Response**:
```json
{
  "message": "Fake data generated successfully",
  "summary": {
    "users_created": 3,
    "weddings_created": 3,
    "guests_created": 90,
    "vendors_created": 24,
    "expenses_created": 45,
    "wedding_cards_created": 3
  },
  "details": {
    "users": [
      {"id": 1, "username": "testuser1", "email": "testuser1@example.com"}
    ]
  }
}
```

#### Generate Sample Wedding
- **POST** `/api/admin/generate-sample-wedding/`
- **Description**: Generate a single sample wedding for testing
- **Request Body**:
```json
{
  "user_id": 1,
  "guest_count": 25,
  "vendor_count": 6,
  "expense_count": 12
}
```
- **Response**:
```json
{
  "message": "Sample wedding created successfully",
  "user": {
    "id": 1,
    "username": "testuser1",
    "email": "testuser1@example.com"
  },
  "wedding": {
    "id": 1,
    "couple_names": "Sarah & Michael",
    "wedding_date": "2024-08-15",
    "venue": "Grand Ballroom",
    "budget": 25000.00
  },
  "created_counts": {
    "guests": 25,
    "vendors": 6,
    "expenses": 12,
    "wedding_cards": 1
  }
}
```

#### Clear All Fake Data
- **DELETE** `/api/admin/clear-fake-data/`
- **Description**: Clear all data from the database (use with caution!)
- **Response**:
```json
{
  "message": "All fake data cleared successfully",
  "deleted_counts": {
    "users": 5,
    "weddings": 5,
    "guests": 150,
    "vendors": 40,
    "expenses": 75,
    "wedding_cards": 5
  }
}
```

#### Get Data Statistics
- **GET** `/api/admin/data-statistics/`
- **Description**: Get statistics about current data in the database
- **Response**:
```json
{
  "statistics": {
    "users": 5,
    "weddings": 5,
    "guests": 150,
    "vendors": 40,
    "expenses": 75,
    "wedding_cards": 5,
    "total_budget": 125000.00,
    "total_expenses": 118750.00
  },
  "averages": {
    "guests_per_wedding": 30,
    "vendors_per_wedding": 8,
    "expenses_per_wedding": 15,
    "budget_per_wedding": 25000.00,
    "expenses_per_budget": 95.0
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": { /* additional error details if available */ }
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden (Admin required for admin endpoints)
- 404: Not Found
- 500: Internal Server Error

## Data Models

### User Model
- `id`: Unique identifier
- `username`: Username (unique)
- `email`: Email address (unique)
- `first_name`: First name
- `last_name`: Last name
- `phone`: Phone number
- `subscription_tier`: free, basic, premium
- `notification_preferences`: Various notification settings
- `privacy_settings`: Privacy configuration options

### Wedding Model
- `id`: Unique identifier
- `user`: Foreign key to User
- `bride_name`: Bride's name
- `groom_name`: Groom's name
- `partner_name`: Partner's name (for same-sex couples)
- `wedding_date`: Wedding date
- `venue`: Venue name
- `venue_address`: Full venue address
- `guest_count`: Expected guest count
- `budget`: Total wedding budget
- `website_url`: Wedding website URL
- `status`: planning, confirmed, completed, cancelled

### Guest Model
- `id`: Unique identifier
- `wedding`: Foreign key to Wedding
- `name`: Guest name
- `email`: Guest email
- `phone`: Guest phone
- `rsvp_status`: pending, confirmed, declined
- `plus_one`: Boolean for plus one
- `relationship`: family, friend, colleague, other
- `dietary_restrictions`: Dietary requirements
- `notes`: Additional notes

### Vendor Model
- `id`: Unique identifier
- `wedding`: Foreign key to Wedding
- `name`: Vendor name
- `vendor_type`: venue, photography, catering, etc.
- `status`: pending, contacted, confirmed, completed, cancelled
- `contact_person`: Contact person name
- `email`: Vendor email
- `phone`: Vendor phone
- `cost`: Total cost
- `deposit_paid`: Amount paid as deposit
- `contract_signed`: Boolean for contract status

### Expense Model
- `id`: Unique identifier
- `wedding`: Foreign key to Wedding
- `description`: Expense description
- `category`: expense category
- `estimated_cost`: Estimated amount
- `actual_cost`: Actual cost
- `amount_paid`: Amount paid
- `payment_status`: pending, partial, paid, overdue
- `vendor`: Foreign key to Vendor (optional)
- `due_date`: Payment due date

### Wedding Card Model
- `id`: Unique identifier
- `wedding`: Foreign key to Wedding
- `template`: Template number (1-6)
- `couple_names`: Display names
- `wedding_details`: Wedding description text
- `primary_color`: Theme color (hex)
- `font_style`: Font style
- `photos`: Array of photo URLs
- `allow_guest_photos`: Boolean for photo uploads
- `require_rsvp`: Boolean for RSVP requirement
- `shareable_link`: Unique public link

## Usage Notes

1. **Authentication**: All private endpoints require token authentication
2. **Pagination**: List endpoints support pagination with `page` parameter
3. **Filtering**: Most list endpoints support filtering via query parameters
4. **Search**: Search functionality available on multiple endpoints
5. **Bulk Operations**: Some endpoints support bulk operations for efficiency
6. **Public Access**: Wedding card viewing and RSVP are publicly accessible via shareable links
7. **Analytics**: Wedding cards include comprehensive analytics tracking
8. **Data Relationships**: Models are properly related with foreign key constraints
9. **Validation**: All endpoints include comprehensive validation
10. **Error Handling**: Consistent error responses across all endpoints

## Integration Guide

### Frontend Integration Steps

1. **Authentication Flow**:
   - Register/login users to get auth token
   - Store token securely (localStorage, sessionStorage, or secure cookie)
   - Include token in all API requests

2. **Wedding Setup**:
   - Create wedding profile after user registration
   - Update wedding details as needed

3. **Data Management**:
   - Use dashboard endpoint for overview data
   - Implement CRUD operations for guests, vendors, expenses
   - Use bulk operations for efficiency

4. **Wedding Cards**:
   - Create digital wedding cards
   - Share public links with guests
   - Track analytics and RSVP responses

5. **Real-time Updates**:
   - Implement polling or websockets for real-time updates
   - Update dashboard statistics based on user actions

### Best Practices

1. **Error Handling**: Implement proper error handling for all API calls
2. **Loading States**: Show loading indicators during API calls
3. **Caching**: Cache frequently accessed data (wedding details, user profile)
4. **Optimization**: Use pagination for large datasets
5. **Validation**: Validate form data before sending to API
6. **Security**: Never expose auth tokens in client-side code
7. **Performance**: Use bulk operations where possible
8. **User Experience**: Provide feedback for all user actions
