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

export interface NewGuest extends Omit<Guest, 'id'> {}
