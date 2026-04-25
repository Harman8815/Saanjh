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
  total_guests: number;
  confirmed_guests: number;
  pending_rsvp: number;
  total_expenses: number;
  paid_expenses: number;
  pending_vendors: number;
  upcoming_payments: number;
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
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  table?: string;
  side?: 'Bride' | 'Groom';
  plusOne: boolean;
  rsvpStatus: 'confirmed' | 'pending' | 'declined';
  mealPreference?: string;
  address?: string;
  notes?: string;
  gender?: 'male' | 'female';
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
  vendor?: Vendor;
  status: ExpenseStatus;
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
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  table?: string;
  side?: 'Bride' | 'Groom';
  plusOne: boolean;
  rsvpStatus: 'confirmed' | 'pending' | 'declined';
  mealPreference?: string;
  address?: string;
  notes?: string;
  gender?: 'male' | 'female';
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
  expense_date?: string;
  due_date?: string;
  notes?: string;
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

// Error types
export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string[]>;
}
