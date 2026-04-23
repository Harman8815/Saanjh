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
  couple_name: string;
  wedding_date: string;
  venue: string;
  budget: number;
  guest_count: number;
  theme: string;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
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

export interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'meeting' | 'payment' | 'deadline' | 'event';
  status: 'pending' | 'completed' | 'overdue';
}

// Guest types
export interface Guest {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  plus_one: boolean;
  plus_one_name?: string;
  dietary_restrictions?: string;
  table_number?: number;
  invitation_sent: boolean;
  invitation_sent_date?: string;
  created_at: string;
  updated_at: string;
}

export interface GuestStatistics {
  total_guests: number;
  confirmed: number;
  declined: number;
  pending: number;
  plus_ones: number;
  dietary_restrictions: number;
}

// Vendor types
export interface Vendor {
  id: number;
  name: string;
  category: 'catering' | 'photography' | 'decoration' | 'music' | 'venue' | 'other';
  contact_person: string;
  email: string;
  phone: string;
  website?: string;
  cost: number;
  status: 'pending' | 'contacted' | 'booked' | 'rejected';
  notes?: string;
  last_contacted?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorStatistics {
  total_vendors: number;
  booked: number;
  contacted: number;
  pending: number;
  total_cost: number;
}

// Expense types
export interface Expense {
  id: number;
  title: string;
  category: 'venue' | 'catering' | 'decoration' | 'photography' | 'music' | 'clothing' | 'other';
  amount: number;
  due_date: string;
  paid: boolean;
  paid_date?: string;
  vendor?: Vendor;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseStatistics {
  total_expenses: number;
  paid_expenses: number;
  unpaid_expenses: number;
  overdue_count: number;
  upcoming_count: number;
  by_category: Record<string, number>;
}

// Wedding Card types
export interface WeddingCard {
  id: number;
  title: string;
  shareable_link: string;
  wedding: Wedding;
  is_public: boolean;
  allow_photo_upload: boolean;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface WeddingCardGuest {
  id: number;
  guest: Guest;
  wedding_card: WeddingCard;
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

// Bulk operation types
export interface BulkGuestCreate {
  guests: Omit<Guest, 'id' | 'created_at' | 'updated_at'>[];
}

export interface BulkRSVPUpdate {
  guest_ids: number[];
  rsvp_status: 'confirmed' | 'declined';
}

export interface BulkVendorStatusUpdate {
  vendor_ids: number[];
  status: 'pending' | 'contacted' | 'booked' | 'rejected';
}

export interface BulkPaymentUpdate {
  expense_ids: number[];
  paid: boolean;
  paid_date?: string;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string[]>;
}
