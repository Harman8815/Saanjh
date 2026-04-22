import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
});

export const profileUpdateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
});

// Wedding schemas
export const weddingCreateSchema = z.object({
  couple_name: z.string().min(1, 'Couple name is required'),
  wedding_date: z.string().min(1, 'Wedding date is required'),
  venue: z.string().min(1, 'Venue is required'),
  budget: z.number().min(0, 'Budget must be a positive number'),
  guest_count: z.number().min(1, 'Guest count must be at least 1'),
  theme: z.string().min(1, 'Theme is required'),
  status: z.enum(['planning', 'confirmed', 'completed', 'cancelled']).optional(),
});

export const weddingUpdateSchema = weddingCreateSchema.partial();

export const timelineEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  type: z.enum(['meeting', 'payment', 'deadline', 'event']),
  status: z.enum(['pending', 'completed', 'overdue']).optional(),
});

// Guest schemas
export const guestCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  rsvp_status: z.enum(['pending', 'confirmed', 'declined']).optional(),
  plus_one: z.boolean().optional(),
  plus_one_name: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  table_number: z.number().optional(),
  invitation_sent: z.boolean().optional(),
});

export const guestUpdateSchema = guestCreateSchema.partial();

export const bulkGuestCreateSchema = z.object({
  guests: z.array(guestCreateSchema).min(1, 'At least one guest is required'),
});

export const bulkRSVPUpdateSchema = z.object({
  guest_ids: z.array(z.number()).min(1, 'At least one guest ID is required'),
  rsvp_status: z.enum(['confirmed', 'declined']),
});

// Vendor schemas
export const vendorCreateSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  category: z.enum(['catering', 'photography', 'decoration', 'music', 'venue', 'other']),
  contact_person: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  website: z.string().url('Invalid website URL').optional(),
  cost: z.number().min(0, 'Cost must be a positive number'),
  status: z.enum(['pending', 'contacted', 'booked', 'rejected']).optional(),
  notes: z.string().optional(),
});

export const vendorUpdateSchema = vendorCreateSchema.partial();

export const bulkVendorStatusUpdateSchema = z.object({
  vendor_ids: z.array(z.number()).min(1, 'At least one vendor ID is required'),
  status: z.enum(['pending', 'contacted', 'booked', 'rejected']),
});

// Expense schemas
export const expenseCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.enum(['venue', 'catering', 'decoration', 'photography', 'music', 'clothing', 'other']),
  amount: z.number().min(0, 'Amount must be a positive number'),
  due_date: z.string().min(1, 'Due date is required'),
  paid: z.boolean().optional(),
  paid_date: z.string().optional(),
  vendor: z.number().optional(),
  notes: z.string().optional(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export const bulkPaymentUpdateSchema = z.object({
  expense_ids: z.array(z.number()).min(1, 'At least one expense ID is required'),
  paid: z.boolean(),
  paid_date: z.string().optional(),
});

// Wedding Card schemas
export const weddingCardCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  wedding: z.number().min(1, 'Wedding ID is required'),
  is_public: z.boolean().optional(),
  allow_photo_upload: z.boolean().optional(),
  message: z.string().optional(),
});

export const weddingCardUpdateSchema = weddingCardCreateSchema.partial();

export const weddingCardGuestCreateSchema = z.object({
  guest: z.number().min(1, 'Guest ID is required'),
  wedding_card: z.number().min(1, 'Wedding card ID is required'),
  notes: z.string().optional(),
});

export const weddingCardGuestUpdateSchema = weddingCardGuestCreateSchema.partial();

// Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type WeddingCreateFormData = z.infer<typeof weddingCreateSchema>;
export type WeddingUpdateFormData = z.infer<typeof weddingUpdateSchema>;
export type TimelineEventFormData = z.infer<typeof timelineEventSchema>;
export type GuestCreateFormData = z.infer<typeof guestCreateSchema>;
export type GuestUpdateFormData = z.infer<typeof guestUpdateSchema>;
export type BulkGuestCreateFormData = z.infer<typeof bulkGuestCreateSchema>;
export type BulkRSVPUpdateFormData = z.infer<typeof bulkRSVPUpdateSchema>;
export type VendorCreateFormData = z.infer<typeof vendorCreateSchema>;
export type VendorUpdateFormData = z.infer<typeof vendorUpdateSchema>;
export type BulkVendorStatusUpdateFormData = z.infer<typeof bulkVendorStatusUpdateSchema>;
export type ExpenseCreateFormData = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdateFormData = z.infer<typeof expenseUpdateSchema>;
export type BulkPaymentUpdateFormData = z.infer<typeof bulkPaymentUpdateSchema>;
export type WeddingCardCreateFormData = z.infer<typeof weddingCardCreateSchema>;
export type WeddingCardUpdateFormData = z.infer<typeof weddingCardUpdateSchema>;
export type WeddingCardGuestCreateFormData = z.infer<typeof weddingCardGuestCreateSchema>;
export type WeddingCardGuestUpdateFormData = z.infer<typeof weddingCardGuestUpdateSchema>;

// Validation helper function
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.issues.forEach((error: any) => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });
  
  return { success: false, errors };
}
