# Wedding Proposal Generator - Project Analysis

## Frontend Pages & Data/Metrics Displayed

### 1. Dashboard (`/dashboard/page.tsx`)
**Data Sources:** WeddingService, GuestService, ExpenseService, VendorService, TimelineService, AdminService
**Metrics Displayed:**
- Days until wedding
- Budget used percentage (total paid / total actual expenses)
- Guest RSVPs confirmed count / total invited
- Tasks completion percentage
- Wedding timeline (upcoming 5 events)
- Recent activity (guests added, expenses logged, vendors updated)
- Upcoming pending tasks (5 items)
- Budget overview: total budget, spent, paid, remaining, progress bar
- Vendor status: total, confirmed, pending, contacted
- Quick actions: Add Guest, Log Expense, Contact Vendor, Update Timeline, Generate Fake Data

### 2. Guest Management (`/dashboard/guests/page.tsx`)
**Data Source:** GuestService.getStatistics()
**Metrics Displayed:**
- Total invited guests
- Confirmed RSVPs
- Pending RSVPs
- Declined RSVPs
- Meal preferences count
- Navigation cards to: Guest List, RSVP Status, Seating Chart, Meal Preferences

### 3. Budget Tracker (`/dashboard/budget/page.tsx`)
**Data Sources:** ExpenseService.getBudgetCategories(), ExpenseService.getExpenses()
**Metrics Displayed:**
- Total budget allocated
- Total spent
- Total paid
- Remaining balance
- Budget progress percentage
- Categories with expenses grouped by budget category
- Expense details: vendor name, amount, paid amount, status, date, notes
- Demographics tab for category breakdown
- History tab with search, filter, sort, date range

### 4. Vendors (`/dashboard/vendors/page.tsx`)
**Data Source:** VendorService.getVendorCatalog()
**Metrics Displayed:**
- Vendor catalog with filtering by category (photographer, catering, decoration, others)
- Search by name, contact, location
- Grid/List view toggle
- Vendor cards showing: name, category, price range, rating, contact
- Category counts

### 5. Tasks (`/dashboard/tasks/page.tsx`)
**Data Sources:** TaskService hooks (useTasks, useTaskStatistics, etc.)
**Metrics Displayed:**
- Total tasks count
- Overdue tasks count
- Due soon (7 days) count
- Recent tasks (7 days) count
- By status breakdown
- By priority breakdown
- Task list with filters: search, status, priority, category
- Bulk actions: delete selected
- CRUD operations with modals

### 6. Timeline (`/dashboard/timeline/page.tsx`)
**Data Source:** TimelineService.filterTimelineEventsByDateRange()
**Metrics Displayed:**
- Three views: Timeline, Calendar (month/week/day), Checklist
- Events with: title, description, date, time, type, status, priority, location
- Day event modal for creating/viewing/editing/deleting events
- Event form modal for create/edit

### 7. Gallery (`/dashboard/gallery/page.tsx`)
**Data Source:** MediaService (getAlbums, getFeaturedAlbums, getAlbumsByEvent)
**Metrics Displayed:**
- Albums with: title, description, event_type, date, cover_image, featured, tags
- Image count, video count per album
- Filter by: All, Pre-Wedding, Wedding Day, Post-Wedding, Featured
- Sort by: date, title, photo count, video count
- Grid/List view
- Album CRUD with modals
- Media upload modal

### 8. Documents (`/dashboard/documents/page.tsx`)
**Data Source:** useDocuments hook (DocumentService)
**Metrics Displayed:**
- Documents with: name, file_type, category, upload_date, size, description, tags
- Filter by category: All, Contracts, Invoices/Bills, IDs & Personal Docs, Miscellaneous
- Sort by: date, name, size
- Grid/List view
- Document preview, edit, download, delete
- Upload modal

### 9. Venues (`/dashboard/venues/page.tsx`)
**Data Source:** Mock data (ready for API integration)
**Metrics Displayed:**
- Venue cards: name, type, capacity, price, location, rating, amenities, availability
- Search and category filter
- Map view placeholder
- Saved venues section
- Comparison tool placeholder

### 10. Wedding Cards (`/dashboard/wedding-cards/page.tsx`)
**Data Source:** Mock data (ready for API integration)
**Metrics Displayed:**
- Template selection (4 templates)
- Card customization: couple names, wedding date, venue, time, dress code, RSVP date
- Live preview
- Sharing options: WhatsApp, Facebook, Twitter, Instagram, Email, Copy Link, Download, QR Code
- QR code generation section
- Email invitations with preview
- Print options: Standard, Premium, DIY PDF

### 11. Public Invitation (`/invite/[uid]/page.tsx`)
**Data Source:** Mock data (fetchInvitationData)
**Templates:** Elegant Classic, Modern Animated
**Data Displayed:**
- Bride & groom names
- Wedding date & venue
- Custom message
- Event sections: ceremony, reception, cocktail, dinner, party (with date, time, venue, description)
- Dynamic colors and fonts per template
- Animated backgrounds for modern template

### 12. Invitation Preview (`/invitation-preview/page.tsx`)
**Data Source:** Hardcoded wedding data
**Features:**
- Phone frame preview
- Template switching (Elegant Classic / Modern Animated)
- Fullscreen toggle
- Download PDF, Share actions

---

## Backend Database Tables & Relationships (Mermaid)

```mermaid
erDiagram
    %% Core Models
    User ||--|| Settings : has
    User ||--o| Wedding : owns
    User ||--o{ Role : has
    
    Wedding ||--o| Venue : selects
    Wedding ||--o| WeddingStatus : has
    Wedding ||--o{ WeddingCard : creates
    Wedding ||--o{ Guest : invites
    Wedding ||--o{ Expense : tracks
    Wedding ||--o{ Vendor : hires
    Wedding ||--o{ Task : plans
    Wedding ||--o| Timeline : has
    Wedding ||--o{ Media : uploads
    Wedding ||--o{ Album : creates
    Wedding ||--o{ Document : manages
    Wedding ||--o{ BudgetCategory : budgets
    
    %% Wedding Cards
    WeddingCard ||--o{ WeddingCardGuest : receives
    WeddingCard ||--|| WeddingCardAnalytics : tracks
    WeddingCardGuest }o--o{ Guest : links
    
    %% Guests
    Guest }o--o{ Table : seated_at
    Guest }o--o{ Meal : prefers
    Guest ||--o{ GuestMeal : meal_preferences
    
    %% Media
    Album ||--o{ MediaAlbum : contains
    Media ||--o{ MediaAlbum : in
    Media }o--|| MediaType : typed_as
    Album ||--o{ AlbumTag : tagged
    
    %% Expenses
    BudgetCategory ||--o{ Expense : categorizes
    ExpenseStatus ||--o{ Expense : status_of
    Vendor ||--o{ Expense : bills
    
    %% Vendors
    VendorCategory ||--o{ VendorCatalog : categorizes
    VendorStatus ||--o{ Vendor : status_of
    VendorCatalog ||--o{ Vendor : instantiated_as
    
    %% Tasks
    TaskStatus ||--o{ Task : status_of
    TaskPriority ||--o{ Task : priority_of
    TaskCategory ||--o{ Task : categorized_as
    User ||--o{ Task : assigned_to
    User ||--o{ Task : created_by
    Task }|--o{ Task : depends_on
    Task }o--o{ DocumentTag : tagged
    
    %% Timeline
    Timeline ||--o{ TimelineEvent : contains
    TimelineStatus ||--o{ TimelineEvent : status_of
    Wedding ||--|| Timeline : owns
    
    %% Documents
    Document }o--o{ DocumentTag : tagged
    DocumentCategory ||--o{ Document : categorized_as (legacy)
    User ||--o{ Document : uploaded_by
```

### Table Definitions

| Table | Key Fields | Relationships |
|-------|------------|---------------|
| `accounts_user` | id, username, email, first_name, last_name, phone, role_id, is_active | FK→Role, 1:1→Settings, 1:1→Wedding |
| `accounts_role` | id, name (bride/groom/guardian/admin) | 1:N→User |
| `accounts_settings` | id, user_id, theme, language, currency, timezone | 1:1→User |
| `weddings_wedding` | id, user_id, venue_id, status_id, wedding_date, theme | FK→User, FK→Venue, FK→WeddingStatus |
| `weddings_wedding_status` | id, name | 1:N→Wedding |
| `weddings_venue_catalog` | id, name, type, address, capacity_min, capacity_max, price, rating | 1:N→Venue, N:M→VenueAmenity |
| `weddings_venue_amenity` | id, name | N:M→VenueCatalog |
| `weddings_venue_amenity_map` | venue_catalog_id, amenity_id | Junction |
| `weddings_venue` | id, venue_catalog_id | FK→VenueCatalog, 1:N→Wedding |
| `wedding_cards_weddingcard` | id, wedding_id, template, couple_names, wedding_details, primary_color, font_style, photos[], shareable_link | FK→Wedding, 1:N→WeddingCardGuest, 1:1→Analytics |
| `wedding_cards_weddingcardguest` | id, wedding_card_id, guest_id, name, email, rsvp_status, plus_one, dietary_restrictions, uploaded_photos[] | FK→WeddingCard, FK→Guest |
| `wedding_cards_weddingcardanalytics` | id, wedding_card_id, total_views, unique_views, total_rsvps, confirmed_rsvps, declined_rsvps, total_photos_uploaded | 1:1→WeddingCard |
| `guests_guest` | id, wedding_id, first_name, last_name, email, phone, rsvp_status_id, rsvp_date, table_id, relationship, address, dietary_restrictions, notes, invitation_sent, reminder_sent | FK→Wedding, FK→RsvpStatus, FK→Table, N:M→Meal |
| `guests_rsvp_status` | id, name | 1:N→Guest |
| `guests_table` | id, wedding_id, table_number, capacity | FK→Wedding, 1:N→Guest |
| `guests_meal` | id, name | N:M→Guest |
| `guests_guest_meal` | guest_id, meal_id | Junction |
| `expenses_expense` | id, wedding_id, budget_category_id, vendor_id, status_id, title, amount, paid_amount, expense_date, due_date, paid_date, notes, receipt_url | FK→Wedding, FK→BudgetCategory, FK→Vendor, FK→ExpenseStatus |
| `expenses_budget_category` | id, wedding_id, name, allocated_amount | FK→Wedding, 1:N→Expense |
| `expenses_expense_status` | id, name | 1:N→Expense |
| `vendors_vendor` | id, wedding_id, vendor_catalog_id, status_id, cost_estimate, actual_cost | FK→Wedding, FK→VendorCatalog, FK→VendorStatus |
| `vendors_vendor_catalog` | id, category_id, name, contact, price_range, rating | FK→VendorCategory, 1:N→Vendor |
| `vendors_vendor_category` | id, name | 1:N→VendorCatalog |
| `vendors_vendor_status` | id, name | 1:N→Vendor |
| `tasks_task` | id, wedding_id, status_id, priority_id, category_id, assigned_to_id, created_by_id, title, description, due_date, completed_at, progress, depends_on (self M:N), tags (DocumentTag M:N) | FK→Wedding, FK→TaskStatus, FK→TaskPriority, FK→TaskCategory, FK→User(x2), M:N→Task, M:N→DocumentTag |
| `tasks_task_status` | id, name, color, order | 1:N→Task |
| `tasks_task_priority` | id, name, color, order | 1:N→Task |
| `tasks_task_category` | id, name, description, color | 1:N→Task |
| `timeline_timeline` | id, wedding_id, name | 1:1→Wedding, 1:N→TimelineEvent |
| `timeline_timeline_event` | id, timeline_id, wedding_id, title, description, date, time, type, status_id, priority, location, notes | FK→Timeline, FK→Wedding, FK→TimelineStatus |
| `timeline_timeline_status` | id, name | 1:N→TimelineEvent |
| `media_media_type` | id, name | 1:N→Media |
| `media_album` | id, wedding_id, title, description, event_type, date, cover_image, featured | FK→Wedding, 1:N→MediaAlbum, 1:N→AlbumTag |
| `media_media` | id, wedding_id, media_type_id, title, file_url, thumbnail_url, file_size | FK→Wedding, FK→MediaType, N:M→Album |
| `media_media_album` | media_id, album_id | Junction |
| `media_album_tag` | id, album_id, name | FK→Album |
| `documents_document` | id, wedding_id, category, name, description, file, file_type, file_size, uploaded_by_id, tags (DocumentTag M:N) | FK→Wedding, FK→User, M:N→DocumentTag |
| `documents_category` | id, name, description | (Legacy, not used in Document model) |
| `documents_tag` | id, name | M:N→Document, M:N→Task |

---

## Backend API Endpoints & Data Returned

### Accounts (`/api/accounts/`)
| Endpoint | Method | Auth | Data Returned |
|----------|--------|------|---------------|
| `/register/` | POST | Public | `{user: UserSerializer, token: string}` |
| `/login/` | POST | Public | `{user: UserSerializer, token: string}` |
| `/logout/` | POST | Auth | `{}` |
| `/profile/` | GET/PUT | Auth | `UserSerializer` (id, username, email, first_name, last_name, phone, role, settings, created_at, updated_at) |
| `/users/` | GET | Auth | `UserSerializer[]` (all users for task assignment) |
| `/stats/` | GET | Auth | `{guest_count, vendor_count, expense_total, days_until_wedding, has_wedding}` |
| `/settings-detail/` | GET/POST | Auth | `SettingsSerializer` (theme, language, currency, timezone) |
| `/roles/` | CRUD | Auth | `RoleSerializer[]` (id, name) |
| `/settings/` | CRUD | Auth | `SettingsSerializer[]` |

### Weddings (`/api/weddings/`)
| Endpoint | Method | Auth | Data Returned |
|----------|--------|------|---------------|
| `/` | GET | Auth | `WeddingSerializer` (user's wedding) |
| `/create/` | POST | Auth | `WeddingSerializer` |
| `/dashboard/` | GET | Auth | `{wedding, guest_stats, vendor_stats, expense_stats, recent_activities}` |
| `/timeline/` | GET | Auth | `TimelineEvent[]` (combined guests/vendors/expenses) |
| `/venue-search/` | GET | Auth | `{venues: VenueCatalogSerializer[], filters, count}` |
| `/weddings/` | CRUD | Auth | `WeddingSerializer` (couple_names, wedding_date, theme, status, venue, days_until_wedding) |
| `/wedding-status/` | CRUD | Auth | `WeddingStatusSerializer` (id, name) |
| `/venues/` | CRUD | Auth | `VenueSerializer` (venue_catalog) |
| `/venue-catalog/` | CRUD | Auth | `VenueCatalogSerializer` (name, type, address, capacity_min/max, price, rating, amenities[]) |
| `/venue-amenities/` | CRUD | Auth | `VenueAmenitySerializer` (id, name) |

### Wedding Cards (`/api/wedding-cards/`)
| Endpoint | Method | Auth | Data Returned |
|----------|--------|------|---------------|
| `/` | GET/POST | Auth | `WeddingCardSerializer[]` / created card |
| `/<pk>/` | GET/PUT/DELETE | Auth | `WeddingCardSerializer` |
| `/<card_id>/guests/` | GET/POST | Auth | `WeddingCardGuestSerializer[]` (id, guest, name, email, rsvp_status, rsvp_date, plus_one, dietary_restrictions, notes, uploaded_photos) |
| `/<card_id>/guests/<pk>/` | GET/PUT/DELETE | Auth | `WeddingCardGuestSerializer` |
| `/<card_id>/analytics/` | GET | Auth | `WeddingCardAnalyticsSerializer` (total_views, unique_views, total_rsvps, confirmed_rsvps, declined_rsvps, total_photos_uploaded, rsvp_rate, last_updated) |
| `/<card_id>/guests/<guest_id>/upload-photo/` | POST | Auth | `{message, uploaded_photos[]}` |
| `/<card_id>/export/` | GET | Auth | `[{name, email, rsvp_status, rsvp_date, plus_one, plus_one_name, dietary_restrictions, notes, uploaded_photos_count}]` |
| **Public** `/<shareable_link>/` | GET | Public | `WeddingCardSerializer` (increments view count) |
| **Public** `/<shareable_link>/rsvp/` | POST | Public | `WeddingCardGuestSerializer` (creates/updates RSVP, updates analytics) |

### Guests (`/api/guests/`)
| Endpoint | Method | Auth | Data Returned |
|----------|--------|------|---------------|
| `/` | GET/POST | Auth | `GuestSerializer[]` / created guest |
| `/bulk/` | POST | Auth | `GuestSerializer[]` (bulk create) |
| `/<pk>/` | GET/PUT/DELETE | Auth | `GuestSerializer` (full_name, rsvp_status, table, meal_preferences, etc.) |
| `/bulk-rsvp-update/` | POST | Auth | `{updated_count}` |
| `/send-invitations/` | POST | Auth | `{updated_count}` |
| `/statistics/` | GET | Auth | `{total, confirmed, pending, declined, invitations_sent, reminders_sent, rsvp_rate, expected_attendees}` |
| `/export/` | GET | Auth | `[{name, email, phone, rsvp_status, relationship, dietary_restrictions, notes, added_date}]` |
| `/seating-chart/` | GET | Auth | `{tables: [{table, guests[]}], unassigned_guests[]}` |
| `/rsvp-status/` | CRUD | Auth | `RsvpStatusSerializer` |
| `/tables/` | CRUD | Auth | `TableSerializer` (assigned_guests count, available_seats) |
| `/meals/` | CRUD | Auth | `MealSerializer` |

### Expenses (`/api/expenses/`)
| Endpoint | Method | Auth | Data Returned |
|----------|--------|------|---------------|
| `/` | GET/POST | Auth | `ExpenseSerializer[]` / created expense |
| `/<pk>/` | GET/PUT/DELETE | Auth | `ExpenseSerializer` (budget_category, status, vendor_name, remaining_balance, is_overdue) |
| `/bulk-payment-update/` | POST | Auth | `{updated_count}` |
| `/statistics/` | GET | Auth | `{total_expenses, total_amount, total_paid, remaining_balance, total_budget, budget_used, budget_remaining, by_status{}, by_category{}, overdue_count}` |
| `/overdue/` | GET | Auth | `ExpenseSerializer[]` |
| `/upcoming/` | GET | Auth | `ExpenseSerializer[]` (due in 30 days) |
| `/summary/` | GET | Auth | `{recent_expenses[5], upcoming_payments[5]}` |
| `/budget-categories/` | CRUD | Auth | `BudgetCategorySerializer` (spent_amount, remaining_amount, expense_count) |
| `/expense-status/` | CRUD | Auth | `ExpenseStatusSerializer` |

### Vendors (`/api/vendors/`)
| Endpoint | Method | Auth | Data Returned |
|----------|--------|------|---------------|
| `/` | GET/POST | Auth | `VendorSerializer[]` / created vendor |
| `/<pk>/` | GET/PUT/DELETE | Auth | `VendorSerializer` (vendor_catalog, status, cost_estimate, actual_cost) |
| `/bulk-status-update/` | POST | Auth | `{updated_count}` |
| `/statistics/` | GET | Auth | `{total, pending, contacted, confirmed, completed, cancelled, by_category{}, total_cost, total_paid, remaining_balance}` |
| `/follow-ups/` | GET | Auth | `VendorSerializer[]` (pending/contacted) |
| `/<pk>/mark-contacted/` | POST | Auth | `{message}` |
| `/vendor-categories/` | CRUD | Auth | `VendorCategorySerializer` |
| `/vendor-status/` | CRUD | Auth | `VendorStatusSerializer` |
| `/vendor-catalog/` | CRUD | Auth | `VendorCatalogSerializer` (category, price_range, rating) |

### Tasks (`/api/tasks/`)
| Endpoint | Method | Auth | Data Returned |
|----------|--------|------|---------------|
| `/tasks/` | GET/POST | Auth | `TaskListSerializer[]` / `TaskSerializer` (status_name, priority_name, category_name, assigned_to_name, created_by_name, wedding_name, is_overdue, days_until_due, can_start, tags, depends_on, dependent_tasks) |
| `/tasks/<pk>/` | GET/PUT/DELETE | Auth | `TaskSerializer` |
| `/tasks/bulk_delete/` | POST | Auth | `{deleted_count}` |
| `/tasks/bulk_update/` | POST | Auth | `{updated_count}` |
| `/tasks/by_status/` | GET | Auth | `{status_id: {name, color, count, tasks[10]}}` |
| `/tasks/statistics/` | GET | Auth | `{total_count, overdue_count, due_soon_count, recent_count, by_status{}, by_priority{}}` |
| `/tasks/<pk>/mark_complete/` | POST | Auth | `TaskSerializer` |
| `/tasks/<pk>/duplicate/` | POST | Auth | `TaskSerializer` |
| `/statuses/` | CRUD | Auth | `TaskStatusSerializer` (id, name, color, order) |
| `/priorities/` | CRUD | Auth | `TaskPrioritySerializer` (id, name, color, order) |
| `/categories/` | CRUD | Auth | `TaskCategorySerializer` (id, name, description, color) |
| `/statistics/` (legacy) | GET | Auth | Same as `/tasks/statistics/` |

### Timeline (`/api/timeline/`)
| Endpoint | Method | Auth | Data Returned |
|----------|--------|------|---------------|
| `/my-timeline/` | GET | Auth | `TimelineSerializer` (id, name, events[]) |
| `/timelines/` | CRUD | Auth | `TimelineSerializer` |
| `/timeline-events/` | CRUD | Auth | `TimelineEventSerializer` (status, filters: month, day, week, start_date, end_date) |
| `/timeline-events/upcoming/` | GET | Auth | `TimelineEventSerializer[]` |
| `/timeline-events/past/` | GET | Auth | `TimelineEventSerializer[]` |
| `/timelines/<pk>/add_event/` | POST | Auth | `TimelineEventSerializer` |
| `/timelines/<pk>/events_summary/` | GET | Auth | `{total_events, upcoming_events, past_events, completed_events, pending_events}` |
| `/timeline-status/` | CRUD | Auth | `TimelineStatusSerializer` |

### Media (`/api/media/`)
| Endpoint | Method | Auth | Data Returned |
|----------|--------|------|---------------|
| `/media/` | GET/POST | Auth | `MediaSerializer[]` / created media (title, file_url, thumbnail_url, file_size, media_type, uploaded_at) |
| `/media/<pk>/` | GET/PUT/DELETE | Auth | `MediaSerializer` |
| `/media/by_type/` | GET | Auth | `MediaSerializer[]` (filter by media_type_id) |
| `/media/gallery/` | GET | Auth | `MediaSerializer[]` (photos & videos) |
| `/media-types/` | CRUD | Auth | `MediaTypeSerializer` |
| `/albums/` | GET/POST | Auth | `AlbumListSerializer[]` / `AlbumSerializer` (tags, image_count, video_count, event_type_display, media_items[50]) |
| `/albums/<pk>/` | GET/PUT/DELETE | Auth | `AlbumSerializer` |
| `/albums/<pk>/add_media/` | POST | Auth | `{added_count}` |
| `/albums/<pk>/remove_media/` | POST | Auth | `{removed_count}` |
| `/albums/by_event/` | GET | Auth | `{event_key: {name, count, albums[]}}` |
| `/albums/featured/` | GET | Auth | `AlbumListSerializer[]` |
| `/statistics/` | GET | Auth | `{total_files, total_size, type_counts{}, recent_uploads[10]}` |

### Documents (`/api/documents/`)
| Endpoint | Method | Auth | Data Returned |
|----------|--------|------|---------------|
| `/documents/` | GET/POST | Auth | `DocumentListSerializer[]` / `DocumentSerializer` (tags, category_display, file_size_display, file_url, uploaded_by_name) |
| `/documents/<pk>/` | GET/PUT/DELETE | Auth | `DocumentSerializer` |
| `/documents/<pk>/download/` | GET | Auth | File download |
| `/documents/statistics/` | GET | Auth | `{total_count, total_size, by_category{}}` |
| `/categories/` | CRUD | Auth | `DocumentCategorySerializer` |
| `/tags/` | CRUD | Auth | `DocumentTagSerializer` |

---

## Backend Capabilities Summary

The backend (Django REST Framework) provides:

1. **Authentication & User Management**
   - Token-based auth (register, login, logout)
   - Role-based access (bride, groom, guardian, admin)
   - User profiles with settings (theme, language, currency, timezone)

2. **Wedding Core**
   - Wedding profile with venue selection from catalog
   - Wedding status tracking
   - Venue catalog with amenities and search by capacity/type

3. **Digital Wedding Cards**
   - Multiple templates (6 options)
   - Customizable design (colors, fonts, photos)
   - Public shareable links with analytics
   - Guest RSVP management (public + authenticated)
   - Photo uploads from guests
   - Export guest data

4. **Guest Management**
   - Full CRUD with bulk operations
   - RSVP tracking with statuses
   - Seating chart with tables
   - Meal preferences
   - Invitation/reminder tracking
   - Statistics & export

5. **Budget & Expenses**
   - Budget categories with allocated amounts
   - Expense tracking with vendor linking
   - Payment status (pending/partial/paid)
   - Overdue/upcoming expense tracking
   - Category-wise breakdown
   - Budget vs actual comparison

6. **Vendor Management**
   - Vendor catalog with categories
   - Vendor selection for wedding
   - Status tracking (pending→contacted→confirmed→completed)
   - Cost estimates vs actual costs
   - Follow-up tracking

7. **Task Management**
   - Kanban-ready with statuses, priorities, categories
   - Task dependencies
   - Assignment to users
   - Progress tracking
   - Bulk operations
   - Statistics (overdue, due soon, by status/priority)

8. **Timeline**
   - Event scheduling with types (meeting, payment, deadline, event, task, reminder)
   - Multiple views support (month, week, day, date range)
   - Status and priority tracking
   - Summary statistics

9. **Media & Gallery**
   - Albums organized by event type
   - Photos/videos with metadata
   - Tagging system
   - Featured albums
   - Statistics

10. **Document Management**
    - Categorized documents (contracts, invoices, IDs, misc)
    - File upload with metadata extraction
    - Tagging system
    - Download support
    - Statistics by category

All APIs return standardized responses using `APIResponse` wrapper with success/error handling.