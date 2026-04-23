# Wedding Planning System - ER Diagram

## Overview
This document contains the Entity-Relationship (ER) diagram for the Wedding Planning System database architecture. The diagram shows all entities, their attributes, and relationships in the system.

## Diagram Images
- **SVG Version**: `../../assets/diagrams/er-diagram.svg`
- **PNG Version**: `../../assets/diagrams/er-diagram.png`

## Mermaid ER Diagram Code
```mermaid
erDiagram

    %% =====================
    %% USERS & ROLES
    %% =====================
    USERS {
        int id
        string username
        string email
        string password_hash
        string first_name
        string last_name
        string phone
        int role_id
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    %% role values: bride/groom/guardian/admin
    ROLE {
        int id
        string name
    }

    SETTINGS {
        int id
        int user_id
        string theme
        string language
        string currency
        string timezone
    }

    %% =====================
    %% WEDDING CORE
    %% =====================
    WEDDING {
        int id
        int user_id
        int venue_id
        date wedding_date
        string theme
        int status_id
        datetime created_at
        datetime updated_at
    }

    %% wedding status values
    WEDDING_STATUS {
        int id
        string name
    }

    %% =====================
    %% VENUE SYSTEM
    %% =====================
    VENUE {
        int id
        int venue_catalog_id
    }

    VENUE_CATALOG {
        int id
        string name
        string type
        string address
        int capacity_min
        int capacity_max
        float price
        float rating
    }

    VENUE_AMENITY {
        int id
        string name
    }

    VENUE_AMENITY_MAP {
        int venue_catalog_id
        int amenity_id
    }

    %% =====================
    %% VENDOR SYSTEM
    %% =====================
    VENDOR {
        int id
        int wedding_id
        int vendor_catalog_id
        int status_id
        float cost_estimate
        float actual_cost
    }

    VENDOR_CATALOG {
        int id
        string name
        int category_id
        string contact
        float price_range
        float rating
    }

    VENDOR_CATEGORY {
        int id
        string name
    }

    VENDOR_STATUS {
        int id
        string name
    }

    %% =====================
    %% GUEST SYSTEM
    %% =====================
    GUEST {
        int id
        int wedding_id
        string first_name
        string last_name
        string email
        string phone
        int table_id
        int rsvp_status_id
    }

    %% rsvp status values
    RSVP_STATUS {
        int id
        string name
    }

    TABLE {
        int id
        int wedding_id
        int table_number
        int capacity
    }

    %% =====================
    %% MEAL SYSTEM
    %% =====================
    MEAL {
        int id
        string name
    }

    GUEST_MEAL {
        int guest_id
        int meal_id
    }

    %% =====================
    %% BUDGET SYSTEM
    %% =====================
    BUDGET_CATEGORY {
        int id
        int wedding_id
        string name
        float allocated_amount
    }

    EXPENSE {
        int id
        int wedding_id
        int budget_category_id
        int vendor_id
        string title
        float amount
        float paid_amount
        int status_id
    }

    EXPENSE_STATUS {
        int id
        string name
    }

    %% =====================
    %% TIMELINE
    %% =====================
    TIMELINE {
        int id
        int wedding_id
        string name
    }

    TIMELINE_EVENT {
        int id
        int timeline_id
        string title
        date event_date
        string start_time
        string end_time
        int status_id
    }

    TIMELINE_STATUS {
        int id
        string name
    }

    %% =====================
    %% TASK SYSTEM
    %% =====================
    TASK {
        int id
        int wedding_id
        string title
        int status_id
        int priority_id
        date due_date
    }

    TASK_STATUS {
        int id
        string name
    }

    TASK_PRIORITY {
        int id
        string name
    }

    %% =====================
    %% RELATIONSHIPS
    %% =====================

    USERS ||--|| ROLE : has
    USERS ||--|| SETTINGS : config
    USERS ||--o{ WEDDING : owns

    WEDDING ||--|| WEDDING_STATUS : status
    WEDDING ||--|| VENUE : selects

    VENUE ||--|| VENUE_CATALOG : references
    VENUE_CATALOG ||--o{ VENUE_AMENITY_MAP : has
    VENUE_AMENITY ||--o{ VENUE_AMENITY_MAP : linked

    WEDDING ||--o{ VENDOR : uses
    VENDOR ||--|| VENDOR_CATALOG : references
    VENDOR ||--|| VENDOR_STATUS : status
    VENDOR_CATALOG ||--|| VENDOR_CATEGORY : belongs

    WEDDING ||--o{ GUEST : has
    GUEST ||--|| RSVP_STATUS : status
    TABLE ||--o{ GUEST : assigned

    GUEST ||--o{ GUEST_MEAL : eats
    MEAL ||--o{ GUEST_MEAL : mapped

    WEDDING ||--o{ BUDGET_CATEGORY : has
    BUDGET_CATEGORY ||--o{ EXPENSE : contains
    EXPENSE ||--|| EXPENSE_STATUS : status

    WEDDING ||--|| TIMELINE : has
    TIMELINE ||--o{ TIMELINE_EVENT : contains
    TIMELINE_EVENT ||--|| TIMELINE_STATUS : status

    WEDDING ||--o{ TASK : manages
    TASK ||--|| TASK_STATUS : status
    TASK ||--|| TASK_PRIORITY : priority


## Entity Descriptions

### Core Entities
- **USERS**: System users with authentication and roles
- **WEDDING**: Main wedding entity containing core wedding information
- **VENUE**: Wedding venue selection and details
- **VENDOR**: Service providers for the wedding

### Management Entities
- **GUEST**: Wedding guest list with RSVP tracking
- **EXPENSE**: Budget and expense tracking
- **TIMELINE**: Wedding planning timeline and events
- **TASK**: Wedding planning tasks and to-dos

### Supporting Entities
- **ROLE**: User roles (bride, groom, guardian, admin)
- **SETTINGS**: User preferences and configuration
- **BUDGET_CATEGORY**: Expense categorization
- **TABLE**: Seating arrangement management

## Relationship Types
- `||--||` : One-to-One relationship
- `||--o{` : One-to-Many relationship
- `o{--o{` : Many-to-Many relationship

## Database Schema Notes
- All entities include `created_at` and `updated_at` timestamps
- Foreign key relationships use `_id` suffix
- Status tables use normalized approach for consistency
- Catalog tables separate master data from transactional data

## Version Information
- **Created**: April 22, 2026
- **Version**: 1.0
- **System**: Wedding Planning System v0.6.0-prod