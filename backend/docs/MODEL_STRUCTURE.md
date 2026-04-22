# Database Model Structure

## Overview

This document outlines the complete database schema for the Wedding Proposal Generator backend. The models are designed to be optimized for performance, minimize redundant dependencies, and provide comprehensive wedding planning functionality.

## Model Relationships

```
User (1:1) Wedding
Wedding (1:N) Guest
Wedding (1:N) Vendor
Wedding (1:N) Expense
Wedding (1:N) WeddingCard
Vendor (1:N) Expense (optional)
WeddingCard (1:N) WeddingCardGuest
WeddingCard (1:1) WeddingCardAnalytics
Guest (1:N) WeddingCardGuest (optional)
```

## Model Details

### User Model (`accounts_user`)

**Purpose**: Custom user model extending Django's AbstractUser with wedding-specific fields.

**Fields**:
- `id` (BigAutoField, Primary Key)
- `username` (CharField, unique, max_length=150)
- `email` (EmailField, unique)
- `first_name` (CharField, max_length=150)
- `last_name` (CharField, max_length=150)
- `phone` (CharField, max_length=20, nullable)
- `date_of_birth` (DateField, nullable)
- `subscription_tier` (CharField, choices: free/basic/premium, default='free')
- `email_notifications` (BooleanField, default=True)
- `sms_notifications` (BooleanField, default=False)
- `push_notifications` (BooleanField, default=True)
- `marketing_emails` (BooleanField, default=False)
- `public_profile` (BooleanField, default=False)
- `share_with_vendors` (BooleanField, default=True)
- `analytics_tracking` (BooleanField, default=True)
- `created_at` (DateTimeField, auto_now_add=True)
- `updated_at` (DateTimeField, auto_now=True)

**Indexes**:
- Unique index on `username`
- Unique index on `email`
- Index on `subscription_tier`

**Optimization Notes**:
- Custom user model allows for wedding-specific fields without additional joins
- Notification preferences stored as booleans for efficient querying
- Subscription tier enables feature-based access control

---

### Wedding Model (`weddings_wedding`)

**Purpose**: Core wedding information container.

**Fields**:
- `id` (BigAutoField, Primary Key)
- `user` (ForeignKey to User, OneToOne, related_name='wedding')
- `bride_name` (CharField, max_length=100, nullable)
- `groom_name` (CharField, max_length=100, nullable)
- `partner_name` (CharField, max_length=100, nullable)
- `wedding_date` (DateField, nullable)
- `venue` (CharField, max_length=255, nullable)
- `venue_address` (TextField, nullable)
- `guest_count` (PositiveIntegerField, default=0)
- `budget` (DecimalField, max_digits=10, decimal_places=2, nullable)
- `website_url` (URLField, nullable)
- `website_domain` (CharField, max_length=100, nullable)
- `status` (CharField, choices: planning/confirmed/completed/cancelled, default='planning')
- `created_at` (DateTimeField, auto_now_add=True)
- `updated_at` (DateTimeField, auto_now=True)

**Methods**:
- `get_couple_name()`: Returns formatted couple names
- `days_until_wedding()`: Calculates days until wedding

**Indexes**:
- Unique index on `user_id`
- Index on `wedding_date`
- Index on `status`

**Optimization Notes**:
- One-to-one relationship with User ensures data integrity
- Flexible name fields support diverse couple configurations
- Budget stored as Decimal for precise financial calculations

---

### Guest Model (`guests_guest`)

**Purpose**: Manages wedding guest information and RSVP tracking.

**Fields**:
- `id` (BigAutoField, Primary Key)
- `wedding` (ForeignKey to Wedding, related_name='guests')
- `name` (CharField, max_length=100)
- `email` (EmailField, nullable)
- `phone` (CharField, max_length=20, nullable)
- `rsvp_status` (CharField, choices: pending/confirmed/declined, default='pending')
- `rsvp_date` (DateField, nullable)
- `plus_one` (BooleanField, default=False)
- `plus_one_name` (CharField, max_length=100, nullable)
- `relationship` (CharField, choices: family/friend/colleague/other, default='friend')
- `address` (TextField, nullable)
- `dietary_restrictions` (TextField, nullable)
- `notes` (TextField, nullable)
- `invitation_sent` (BooleanField, default=False)
- `invitation_sent_date` (DateTimeField, nullable)
- `reminder_sent` (BooleanField, default=False)
- `reminder_sent_date` (DateTimeField, nullable)
- `added_date` (DateTimeField, auto_now_add=True)
- `updated_at` (DateTimeField, auto_now=True)

**Indexes**:
- Composite index on `wedding_id` and `rsvp_status`
- Index on `wedding_id` and `name`
- Index on `email` (for duplicate checking)

**Optimization Notes**:
- RSVP tracking enables comprehensive guest management
- Invitation tracking supports automated reminder systems
- Relationship categorization aids in guest organization

---

### Vendor Model (`vendors_vendor`)

**Purpose**: Tracks wedding service providers and booking status.

**Fields**:
- `id` (BigAutoField, Primary Key)
- `wedding` (ForeignKey to Wedding, related_name='vendors')
- `name` (CharField, max_length=200)
- `vendor_type` (CharField, choices: venue/photography/catering/florist/music/cake/decorations/transportation/officiant/other)
- `status` (CharField, choices: pending/contacted/confirmed/completed/cancelled, default='pending')
- `contact_person` (CharField, max_length=100, nullable)
- `email` (EmailField, nullable)
- `phone` (CharField, max_length=20, nullable)
- `website` (URLField, nullable)
- `address` (TextField, nullable)
- `cost` (DecimalField, max_digits=10, decimal_places=2, nullable)
- `deposit_paid` (DecimalField, max_digits=10, decimal_places=2, nullable)
- `booking_date` (DateField, nullable)
- `contract_signed` (BooleanField, default=False)
- `contract_signed_date` (DateField, nullable)
- `services_provided` (TextField, nullable)
- `notes` (TextField, nullable)
- `last_contact_date` (DateTimeField, nullable)
- `next_follow_up` (DateField, nullable)
- `created_at` (DateTimeField, auto_now_add=True)
- `updated_at` (DateTimeField, auto_now=True)

**Indexes**:
- Composite index on `wedding_id` and `vendor_type`
- Composite index on `wedding_id` and `status`
- Index on `next_follow_up` (for follow-up reminders)

**Optimization Notes**:
- Comprehensive vendor type categorization
- Follow-up tracking enables automated vendor management
- Cost tracking integrates with expense management

---

### Expense Model (`expenses_expense`)

**Purpose**: Tracks wedding expenses and budget management.

**Fields**:
- `id` (BigAutoField, Primary Key)
- `wedding` (ForeignKey to Wedding, related_name='expenses')
- `description` (CharField, max_length=200)
- `category` (CharField, choices: venue/catering/photography/videography/florist/music/cake/decorations/attire/rings/transportation/accommodation/invitations/gifts/other)
- `estimated_cost` (DecimalField, max_digits=10, decimal_places=2)
- `actual_cost` (DecimalField, max_digits=10, decimal_places=2, nullable)
- `amount_paid` (DecimalField, max_digits=10, decimal_places=2, default=0)
- `payment_status` (CharField, choices: pending/partial/paid/overdue, default='pending')
- `vendor` (ForeignKey to Vendor, nullable, related_name='expenses')
- `expense_date` (DateField, nullable)
- `due_date` (DateField, nullable)
- `paid_date` (DateField, nullable)
- `notes` (TextField, nullable)
- `receipt_url` (URLField, nullable)
- `created_at` (DateTimeField, auto_now_add=True)
- `updated_at` (DateTimeField, auto_now=True)

**Methods**:
- `remaining_balance()`: Calculates remaining payment amount
- `is_overdue()`: Checks if payment is overdue

**Indexes**:
- Composite index on `wedding_id` and `category`
- Composite index on `wedding_id` and `payment_status`
- Index on `due_date` (for overdue payment tracking)
- Index on `vendor_id` (for vendor expense lookup)

**Optimization Notes**:
- Estimated vs. actual cost tracking enables budget variance analysis
- Payment status tracking supports cash flow management
- Optional vendor relationship maintains data integrity while allowing flexibility

---

### WeddingCard Model (`wedding_cards_weddingcard`)

**Purpose**: Digital wedding invitation cards with customization options.

**Fields**:
- `id` (BigAutoField, Primary Key)
- `wedding` (ForeignKey to Wedding, related_name='wedding_cards')
- `template` (IntegerField, choices: 1-6 templates, default=1)
- `couple_names` (CharField, max_length=200)
- `wedding_details` (TextField)
- `primary_color` (CharField, max_length=7, default='#8B5CF6')
- `font_style` (CharField, choices: elegant/modern/playful/vintage/minimal, default='elegant')
- `photos` (JSONField, default=list)
- `allow_guest_photos` (BooleanField, default=True)
- `require_rsvp` (BooleanField, default=True)
- `send_reminders` (BooleanField, default=True)
- `shareable_link` (SlugField, unique, blank=True)
- `created_at` (DateTimeField, auto_now_add=True)
- `updated_at` (DateTimeField, auto_now=True)

**Methods**:
- `save()`: Auto-generates shareable_link if not provided

**Indexes**:
- Unique index on `shareable_link`
- Index on `wedding_id`
- Index on `template`

**Optimization Notes**:
- JSONField for photos allows flexible photo storage without additional tables
- Auto-generated shareable links ensure public accessibility
- Template system enables consistent design patterns

---

### WeddingCardGuest Model (`wedding_cards_weddingcardguest`)

**Purpose**: Manages RSVPs for digital wedding cards.

**Fields**:
- `id` (BigAutoField, Primary Key)
- `wedding_card` (ForeignKey to WeddingCard, related_name='card_guests')
- `guest` (ForeignKey to Guest, nullable, related_name='card_rsvps')
- `name` (CharField, max_length=100)
- `email` (EmailField, nullable)
- `rsvp_status` (CharField, choices: pending/confirmed/declined, default='pending')
- `rsvp_date` (DateTimeField, auto_now=True)
- `plus_one` (BooleanField, default=False)
- `plus_one_name` (CharField, max_length=100, nullable)
- `dietary_restrictions` (TextField, nullable)
- `notes` (TextField, nullable)
- `uploaded_photos` (JSONField, default=list)

**Indexes**:
- Composite index on `wedding_card_id` and `rsvp_status`
- Index on `guest_id` (for linking with main guest list)
- Index on `email` (for duplicate RSVP prevention)

**Optimization Notes**:
- Optional relationship with main Guest model allows external RSVPs
- JSONField for photos supports guest photo uploads
- Auto-updating RSVP date tracks response timeline

---

### WeddingCardAnalytics Model (`wedding_cards_weddingcardanalytics`)

**Purpose**: Tracks analytics for wedding card performance.

**Fields**:
- `id` (BigAutoField, Primary Key)
- `wedding_card` (OneToOneField to WeddingCard, related_name='analytics')
- `total_views` (PositiveIntegerField, default=0)
- `unique_views` (PositiveIntegerField, default=0)
- `total_rsvps` (PositiveIntegerField, default=0)
- `confirmed_rsvps` (PositiveIntegerField, default=0)
- `declined_rsvps` (PositiveIntegerField, default=0)
- `total_photos_uploaded` (PositiveIntegerField, default=0)
- `last_updated` (DateTimeField, auto_now=True)

**Methods**:
- `get_rsvp_rate()`: Calculates RSVP conversion rate

**Indexes**:
- Unique index on `wedding_card_id`

**Optimization Notes**:
- One-to-one relationship ensures single analytics record per card
- Comprehensive metrics support detailed performance analysis
- Auto-updating timestamps ensure data freshness

---

## Database Optimization Strategies

### 1. Indexing Strategy

**Primary Indexes**:
- All foreign keys have indexes for efficient joins
- Unique constraints on username, email, and shareable_link
- Composite indexes for common query patterns

**Query Optimization**:
- Wedding-centric queries use wedding_id as primary filter
- Status-based queries use composite indexes
- Date-based queries use date field indexes

### 2. Data Type Optimization

**Numeric Fields**:
- DecimalField for financial data (precise calculations)
- PositiveIntegerField for counts (no negative values)
- BooleanField for flags (efficient storage)

**Text Fields**:
- CharField for fixed-length text (names, emails)
- TextField for variable-length content (descriptions, notes)
- JSONField for structured data (photos, arrays)

### 3. Relationship Optimization

**Foreign Key Constraints**:
- Proper cascading deletes maintain data integrity
- Nullable relationships provide flexibility
- Related_name attributes enable reverse lookups

**Query Efficiency**:
- Prefetch_related for one-to-many relationships
- Select_related for foreign key relationships
- Bulk operations for multiple record updates

### 4. Redundancy Minimization

**Shared Data Structures**:
- User model centralizes authentication and preferences
- Wedding model serves as central hub for all wedding data
- Vendor model links to expenses for cost tracking

**Avoiding Duplication**:
- Guest RSVPs linked to main guest list when possible
- Expense categories standardized across all expenses
- Template system reused for wedding cards

### 5. Performance Considerations

**Read Optimization**:
- Dashboard data aggregated efficiently
- Statistics queries use database aggregations
- Pagination implemented for large datasets

**Write Optimization**:
- Bulk create operations for guest imports
- Atomic transactions for data consistency
- Optimized serializers for API responses

## Migration Strategy

### Initial Setup
1. Create custom User model with AUTH_USER_MODEL setting
2. Run initial migrations to create base tables
3. Create wedding profile for existing users

### Data Migration
1. Import existing guest lists via bulk operations
2. Migrate vendor data with relationship preservation
3. Transfer expense data with category mapping

### Future Scaling
1. Partition large tables by wedding_id if needed
2. Implement read replicas for reporting queries
3. Add caching layer for frequently accessed data

## Security Considerations

### Data Protection
- User authentication required for all private endpoints
- Public wedding cards use shareable links only
- Sensitive financial data properly validated

### Access Control
- Wedding data isolated by user ownership
- Public endpoints limited to read-only operations
- API rate limiting implemented

### Data Integrity
- Foreign key constraints prevent orphaned records
- Unique constraints prevent duplicate data
- Validation rules ensure data quality
