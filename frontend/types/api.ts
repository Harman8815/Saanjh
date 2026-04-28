// Base API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Authentication types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: Role;
  role_id?: number;
  is_active: boolean;
  settings?: Settings;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Settings {
  id: number;
  theme: string;
  language: string;
  currency: string;
  timezone: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  password: string;
  password_confirm: string;
  role_id: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Wedding types
export interface Wedding {
  id: number;
  user: number;
  venue?: Venue;
  status: WeddingStatus;
  wedding_date?: string;
  theme?: string;
  created_at: string;
  updated_at: string;
}

export interface WeddingStatus {
  id: number;
  name: string;
}

export interface Venue {
  id: number;
  venue_catalog: VenueCatalog;
}

export interface VenueCatalog {
  id: number;
  name: string;
  type: 'hotel' | 'restaurant' | 'outdoor' | 'church' | 'beach' | 'garden' | 'ballroom' | 'other';
  address: string;
  capacity_min: number;
  capacity_max: number;
  price: number;
  rating: number;
  amenities?: VenueAmenity[];
}

export interface VenueAmenity {
  id: number;
  name: string;
}

export interface WeddingDashboard {
  wedding: {
    id: number;
    user: number;
    couple_names: string;
    wedding_date: string;
    theme: string;
    status: {
      id: number;
      name: string;
    };
    venue?: {
      id: number;
      venue_catalog: {
        id: number;
        name: string;
        type: string;
        address: string;
        capacity_min: number;
        capacity_max: number;
        price: string;
        rating: number;
      };
    };
    days_until_wedding: number;
    created_at: string;
    updated_at: string;
  };
  guest_stats: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
  };
  vendor_stats: {
    total: number;
    confirmed: number;
    pending: number;
    contacted: number;
  };
  expense_stats: {
    total_estimated: number;
    total_actual: number;
    total_paid: number;
    remaining: number;
    budget_used: number;
  };
  recent_activities: {
    guests: Array<{
      name: string;
      date: string;
      type: string;
    }>;
    expenses: Array<{
      description: string;
      date: string;
      type: string;
    }>;
    vendors: Array<{
      name: string;
      date: string | null;
      type: string;
    }>;
  };
}

export interface WeddingTimeline {
  events: TimelineEvent[];
}

// Timeline types
export interface Timeline {
  id: number;
  wedding: number;
  events: TimelineEvent[];
}

export interface TimelineEvent {
  id: number;
  timeline?: number;
  wedding?: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: 'meeting' | 'payment' | 'deadline' | 'event' | 'task' | 'reminder';
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  location?: string;
  attendees?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineStatus {
  id: number;
  name: string;
}

// Guest types
export interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  rsvp_status: RsvpStatus;
  rsvp_status_id: number;
  rsvp_date?: string;
  table?: Table;
  table_id?: number | null;
  meal_preferences: Meal[];
  meal_ids?: number[];
  relationship: string;
  address?: string;
  dietary_restrictions?: string;
  notes?: string;
  invitation_sent: boolean;
  invitation_sent_date?: string;
  reminder_sent: boolean;
  reminder_sent_date?: string;
  added_date: string;
  updated_at: string;
}

export interface RsvpStatus {
  id: number;
  name: string;
}

export interface Table {
  id: number;
  wedding: number;
  table_number: number;
  capacity: number;
}

export interface Meal {
  id: number;
  name: string;
}

export interface GuestStatistics {
  total_guests: number;
  confirmed: number;
  declined: number;
  pending: number;
  plus_ones: number;
  dietary_restrictions: number;
  by_relationship: Record<string, number>;
  by_rsvp_status: Record<string, number>;
}

// Vendor types
export interface Vendor {
  id: number;
  wedding: number;
  vendor_catalog?: VendorCatalog;
  status: VendorStatus;
  cost_estimate?: number;
  actual_cost?: number;
}

export interface VendorCatalog {
  id: number;
  category: VendorCategory;
  name: string;
  contact: string;
  price_range: number;
  rating: number;
}

export interface VendorCategory {
  id: number;
  name: string;
}

export interface VendorStatus {
  id: number;
  name: string;
}

export interface VendorStatistics {
  total_vendors: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  total_estimated_cost: number;
  total_actual_cost: number;
}

// Expense types
export interface Expense {
  id: number;
  wedding: number;
  budget_category?: BudgetCategory;
  budget_category_id?: number;
  vendor?: Vendor;
  vendor_id?: number;
  status: ExpenseStatus;
  status_id?: number;
  title: string;
  amount: number;
  paid_amount: number;
  expense_date?: string;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: number;
  wedding: number;
  name: string;
  allocated_amount: number;
  spent_amount?: number;
  remaining_amount?: number;
}

export interface ExpenseStatus {
  id: number;
  name: string;
}

export interface ExpenseStatistics {
  total_expenses: number;
  total_budget: number;
  spent_amount: number;
  remaining_budget: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  overdue_count: number;
  upcoming_count: number;
}

// Wedding Card types
export interface WeddingCard {
  id: number;
  title: string;
  shareable_link: string;
  wedding: number;
  is_public: boolean;
  allow_photo_upload: boolean;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface WeddingCardGuest {
  id: number;
  guest: number;
  wedding_card: number;
  photo_url?: string;
  photo_uploaded_at?: string;
  notes?: string;
  created_at: string;
}

export interface WeddingCardAnalytics {
  total_views: number;
  unique_guests: number;
  photos_uploaded: number;
  last_activity: string;
}

// Media types
export interface Media {
  id: number;
  wedding: number;
  media_type: MediaType;
  title?: string;
  description?: string;
  file_url: string;
  thumbnail_url?: string;
  file_size: number;
  upload_date: string;
  is_public: boolean;
  tags?: string[];
}

export interface MediaType {
  id: number;
  name: string;
  mime_types: string[];
}

export interface MediaStatistics {
  total_files: number;
  total_size: number;
  by_type: Record<string, number>;
  recent_uploads: Media[];
}

// Album types
export interface Album {
  id: number;
  title: string;
  description?: string;
  event_type: 'pre-wedding' | 'wedding-day' | 'post-wedding' | 'other';
  event_type_display: string;
  date?: string;
  cover_image?: string;
  featured: boolean;
  tags: AlbumTag[];
  image_count: number;
  video_count: number;
  media_items?: Media[];
  created_at: string;
  updated_at: string;
}

export interface AlbumTag {
  id: number;
  name: string;
}

export interface AlbumCreateRequest {
  title: string;
  description?: string;
  event_type: 'pre-wedding' | 'wedding-day' | 'post-wedding' | 'other';
  date?: string;
  cover_image?: string;
  featured?: boolean;
  tag_names?: string[];
}

export interface AlbumUpdateRequest {
  title?: string;
  description?: string;
  event_type?: 'pre-wedding' | 'wedding-day' | 'post-wedding' | 'other';
  date?: string;
  cover_image?: string;
  featured?: boolean;
  tag_names?: string[];
}

// Bulk operation types
export interface BulkGuestCreate {
  guests: Omit<Guest, 'id' | 'added_date' | 'updated_at'>[];
}

export interface BulkRSVPUpdate {
  guest_ids: number[];
  rsvp_status: number; // RSVP status ID
}

export interface BulkVendorStatusUpdate {
  vendor_ids: number[];
  status: number; // Vendor status ID
}

export interface BulkPaymentUpdate {
  expense_ids: number[];
  paid_amount: number;
  paid_date?: string;
}

// Request types
export interface WeddingCreateRequest {
  wedding_date?: string;
  theme?: string;
  venue_catalog_id?: number;
}

export interface GuestCreateRequest {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  address?: string;
  dietary_restrictions?: string;
  notes?: string;
  meal_ids?: number[];
}

export interface VendorCreateRequest {
  vendor_catalog_id: number;
  cost_estimate?: number;
}

export interface ExpenseCreateRequest {
  budget_category_id?: number;
  vendor_id?: number;
  title: string;
  amount: number;
  paid_amount?: number;
  expense_date?: string;
  due_date?: string;
  notes?: string;
  status_id?: number;
}

export interface WeddingCardCreateRequest {
  title: string;
  is_public: boolean;
  allow_photo_upload: boolean;
  message: string;
}

export interface TimelineEventCreateRequest {
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: 'meeting' | 'payment' | 'deadline' | 'event' | 'task' | 'reminder';
  priority?: 'low' | 'medium' | 'high';
  location?: string;
  attendees?: string[];
  notes?: string;
}

// Document types
export interface Document {
  id: number;
  name: string;
  description?: string;
  category: 'contracts' | 'invoices' | 'ids' | 'miscellaneous';
  category_display: string;
  file: string;
  file_url: string;
  file_type: string;
  file_size: number;
  file_size_display: string;
  tags: DocumentTag[];
  uploaded_at: string;
  updated_at: string;
  uploaded_by?: number;
  uploaded_by_name?: string;
}

export interface DocumentTag {
  id: number;
  name: string;
}

export interface DocumentCategory {
  id: number;
  name: string;
  description?: string;
}

export interface DocumentStatistics {
  total_count: number;
  total_size: number;
  total_size_display: string;
  by_category: Record<string, {
    name: string;
    count: number;
    size: number;
  }>;
  recent_uploads: Document[];
}

export interface DocumentCreateRequest {
  name: string;
  description?: string;
  category: 'contracts' | 'invoices' | 'ids' | 'miscellaneous';
  file: File;
  tag_names?: string[];
}

export interface DocumentUpdateRequest {
  name?: string;
  description?: string;
  category?: 'contracts' | 'invoices' | 'ids' | 'miscellaneous';
  tag_names?: string[];
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string[]>;
}
