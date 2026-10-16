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
  /** Legacy DRF token, still issued for older API clients. */
  token: string;
  /** Short-lived JWT access token, delivered as an HttpOnly cookie. */
  access?: string;
  /** Long-lived refresh token, delivered as an HttpOnly cookie. */
  refresh?: string;
  /** Access token lifetime in seconds. */
  expires_in?: number;
  /** Id of the session (device) the tokens were issued for. */
  session_id?: string;
}

// Wedding types
export interface Wedding {
  id: number;
  user: number;
  venue?: Venue;
  venue_catalog?: VenueCatalog;
  status: WeddingStatus;
  saved_venues?: number[];
  wedding_date?: string;
  theme?: string;
  couple_names?: string;
  days_until_wedding?: number;
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
  latitude?: number | null;
  longitude?: number | null;
}

export interface VenueAmenity {
  id: number;
  name: string;
}

// Wedding insights: shared metric names, readiness, and alerts.
// Computed server-side in utils/wedding_insights.py — the single source of truth.
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface WeddingAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  action_label: string | null;
  action_url: string | null;
  entity_type: string | null;
  entity_id: number | null;
}

export interface ReadinessDomain {
  key: string;
  label: string;
  /** Completion percentage (0-100) for this domain. */
  pct: number;
  /** Weight in the overall score (weights sum to 1.0). */
  weight: number;
  /** Optional supporting counts (e.g. confirmed/total guests). */
  detail?: Record<string, number>;
}

export interface Readiness {
  /** Weighted mean of the domain percentages (0-100). */
  score: number;
  domains: ReadinessDomain[];
}

export interface WeddingMetrics {
  total_budget: number;
  committed: number;
  paid: number;
  outstanding: number;
  budget_used_pct: number;
  projected_final_cost: number;
  guest_stats: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
    invitations_sent: number;
  };
  vendor_stats: {
    total: number;
    confirmed: number;
    pending: number;
    contacted: number;
  };
  tasks: Record<string, number>;
  tasks_completion_pct: number;
  expenses_count: number;
  overdue_expenses_count: number;
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
  /** Phase 3 metrics block (same definitions everywhere). */
  metrics?: WeddingMetrics;
  /** Weighted readiness score with per-domain breakdown. */
  readiness?: Readiness;
  /** Actionable alerts, most severe first. */
  alerts?: WeddingAlert[];
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
  end_time?: string;
  has_conflict?: boolean;
  type: 'meeting' | 'payment' | 'deadline' | 'event' | 'task' | 'reminder';
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  location?: string;
  attendees?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineConflict {
  date: string;
  overlap_start: string;
  overlap_end: string;
  events: TimelineEvent[];
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
  // Stage 2: groups, plus-ones, dietary preferences
  group?: GuestGroup | null;
  group_id?: number | null;
  plus_one_name?: string;
  plus_one_rsvp_status?: RsvpStatus | null;
  plus_one_rsvp_status_id?: number | null;
  is_plus_one_of?: number | null;
  dietary_preferences?: DietaryOption[];
  dietary_ids?: number[];
}

export interface GuestGroup {
  id: number;
  name: string;
  side: 'bride' | 'groom' | 'both';
  side_display: string;
  group_type: 'family' | 'friend' | 'colleague' | 'household';
  group_type_display: string;
  notes?: string;
  guest_count: number;
  created_at: string;
  updated_at: string;
}

export interface GuestGroupCreateRequest {
  name: string;
  side?: GuestGroup['side'];
  group_type?: GuestGroup['group_type'];
  notes?: string;
}

export interface DietaryOption {
  id: number;
  name: string;
}

/** One parsed spreadsheet row from the import preview. */
export interface GuestImportRowPreview {
  row: number;
  valid: boolean;
  data: Record<string, unknown> | null;
  errors: string[];
  is_duplicate: boolean;
}

export interface GuestImportPreview {
  token: string;
  summary: {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    duplicate_rows: number;
  };
  rows: GuestImportRowPreview[];
  max_rows: number;
}

export interface GuestImportResult {
  created: number;
  skipped: number;
  errors?: string[];
}

export interface DuplicateCluster {
  cluster_id: number;
  suggested_primary: number;
  match_score: number;
  reason: string;
  guests: Guest[];
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
  assigned_guests?: number;
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
export interface VendorQuote {
  id: number;
  vendor: number;
  title: string;
  amount: number | string;
  valid_until?: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  document?: number | null;
  document_title?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorContract {
  id: number;
  vendor: number;
  signed_date?: string | null;
  terms?: string;
  expiry_date?: string | null;
  document?: number | null;
  document_title?: string | null;
  deposit_amount: number | string;
  deposit_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorMilestone {
  id: number;
  vendor: number;
  name: string;
  amount: number | string;
  due_date?: string | null;
  paid: boolean;
  paid_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorCommunication {
  id: number;
  vendor: number;
  type: 'email' | 'call' | 'meeting' | 'note';
  direction: 'inbound' | 'outbound';
  subject: string;
  body: string;
  occurred_at: string;
  follow_up_date?: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorComparisonItem {
  id: number;
  name: string;
  category: string;
  contact: string;
  price_range: number | string;
  rating?: number | null;
  status: string;
  cost_estimate?: number | null;
  actual_cost?: number | null;
  cost_variance?: number | null;
  follow_up_date?: string | null;
  contract?: {
    id: number;
    signed_date?: string | null;
    expiry_date?: string | null;
    deposit_amount: number;
    deposit_paid: boolean;
    document_id?: number | null;
  } | null;
  quotes: {
    total_count: number;
    has_accepted: boolean;
    accepted_amount?: number | null;
    latest_status?: string | null;
  };
  milestones: {
    total_count: number;
    paid_count: number;
    total_amount: number;
    paid_amount: number;
  };
  expenses: {
    total: number;
    paid: number;
  };
}

export interface Vendor {
  id: number;
  wedding: number;
  vendor_catalog?: VendorCatalog;
  status: VendorStatus;
  cost_estimate?: number;
  actual_cost?: number;
  cost_variance?: number | null;
  follow_up_date?: string | null;
  quotes?: VendorQuote[];
  contract?: VendorContract | null;
  milestones?: VendorMilestone[];
  expenses_total?: string | number;
  created_at?: string;
  updated_at?: string;
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

// Venue catalog types (shared reference data, readable by any authenticated user)
// Using the VenueCatalog defined above (line 96)

// Wedding Card types
export interface WeddingCard {  id: number;
  template: number;
  couple_names: string;
  wedding_details: string;
  primary_color: string;
  font_style: string;
  photos: string[];
  allow_guest_photos: boolean;
  require_rsvp: boolean;
  send_reminders: boolean;
  shareable_link: string;
  created_at: string;
  updated_at: string;
}

export interface WeddingCardGuest {
  id: number;
  guest: number;
  wedding_card: number;
  name: string;
  email: string;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  rsvp_date?: string;
  plus_one: boolean;
  plus_one_name: string;
  dietary_restrictions: string;
  notes: string;
  photo_url?: string;
  photo_uploaded_at?: string;
  uploaded_photos: string[];
  created_at: string;
}

export interface WeddingCardGuestCreateRequest {
  name: string;
  email: string;
  rsvp_status?: 'pending' | 'confirmed' | 'declined';
  plus_one?: boolean;
  plus_one_name?: string;
  dietary_restrictions?: string;
  notes?: string;
}

export interface PublicRsvpRequest {
  name: string;
  email: string;
  rsvp_status: 'confirmed' | 'declined';
  plus_one?: boolean;
  plus_one_name?: string;
  dietary_restrictions?: string;
  notes?: string;
}

export interface WeddingCardAnalytics {
  total_views: number;
  unique_guests: number;
  photos_uploaded: number;
  total_photos_uploaded: number;
  total_rsvps: number;
  confirmed_rsvps: number;
  declined_rsvps: number;
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
  end_time?: string;
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

// Task Management Types
export interface Task {
  id: number;
  wedding: number;
  wedding_name?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  status_name: string;
  priority: TaskPriority;
  priority_name: string;
  category?: TaskCategory;
  category_name?: string;
  assigned_to?: User;
  assigned_to_name?: string;
  due_date?: string;
  completed_at?: string;
  progress: number;
  created_by?: User;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  is_overdue: boolean;
  days_until_due?: number;
  can_start: boolean;
  tags: string[];
  depends_on: Task[];
  dependent_tasks: Task[];
  parent?: number | null;
  subtasks?: Task[];
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_interval: number;
  recurrence_ends_on?: string | null;
}

export interface TaskBoard {
  categories: TaskCategory[];
  selected_category: TaskCategory | null;
  columns: Array<{
    task_status: TaskStatus;
    count: number;
    tasks: Task[];
  }>;
}

export interface TaskTemplate {
  id: number;
  name: string;
  description: string;
  items: Array<{
    id: number;
    title: string;
    description: string;
    offset_days: number;
    priority: number | null;
    category: number | null;
    priority_name?: string;
    category_name?: string;
  }>;
}

export interface TaskStatus {
  id: number;
  name: string;
  color: string;
  order: number;
}

export interface TaskPriority {
  id: number;
  name: string;
  color: string;
  order: number;
}

export interface TaskCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  status?: number;
  priority?: number;
  category?: number;
  assigned_to?: number;
  due_date?: string;
  progress?: number;
  depends_on?: number[];
  tags?: string[];
  parent?: number | null;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_interval?: number;
  recurrence_ends_on?: string | null;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  status?: number;
  priority?: number;
  category?: number;
  assigned_to?: number;
  due_date?: string;
  progress?: number;
  depends_on?: number[];
  tags?: string[];
  parent?: number | null;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_interval?: number;
  recurrence_ends_on?: string | null;
}

export interface TaskStatistics {
  total_count: number;
  overdue_count: number;
  due_soon_count: number;
  recent_count: number;
  by_status: Record<number, {
    name: string;
    color: string;
    count: number;
  }>;
  by_priority: Record<number, {
    name: string;
    color: string;
    count: number;
  }>;
}

export interface TaskBulkUpdateRequest {
  task_ids: number[];
  updates: Partial<TaskUpdateRequest>;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string[]>;
}
