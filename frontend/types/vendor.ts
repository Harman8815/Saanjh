export type VendorCategory = 'photographer' | 'catering' | 'decoration' | 'others';

export type VendorStatus = 'available' | 'unavailable' | 'booked';

export interface BaseVendor {
  id: string;
  name: string;
  category: VendorCategory;
  rating: number;
  reviewCount: number;
  location: string;
  description: string;
  phone: string;
  email: string;
  website?: string;
  status: VendorStatus;
  image: string;
  gallery: string[];
  pricing: {
    currency: string;
    startingPrice: number;
    priceRange: '$' | '$$' | '$$$' | '$$$$';
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'starter' | 'main' | 'dessert' | 'beverage' | 'appetizer';
  isVegetarian: boolean;
  isVegan?: boolean;
  serves: number;
  image?: string;
}

export interface CateringPackage {
  id: string;
  name: string;
  description: string;
  pricePerPlate: number;
  minGuests: number;
  maxGuests?: number;
  includes: string[];
  menuItems: string[];
}

export interface CateringVendor extends BaseVendor {
  category: 'catering';
  cuisine: string[];
  menu: MenuItem[];
  packages: CateringPackage[];
  dietaryOptions: string[];
  serviceStyle: 'buffet' | 'plated' | 'family-style' | 'food-station' | 'cocktail';
  tastingsAvailable: boolean;
}

export interface PhotoItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail: string;
  title: string;
  category: 'wedding' | 'engagement' | 'portrait' | 'event' | 'commercial';
}

export interface PhotographyPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  includes: string[];
  deliverables: {
    editedPhotos: number;
    rawPhotos?: number;
    albums?: number;
    videos?: number;
    prints?: number;
  };
}

export interface PhotographerVendor extends BaseVendor {
  category: 'photographer';
  specialty: string[];
  equipment: string[];
  portfolio: PhotoItem[];
  packages: PhotographyPackage[];
  style: string[];
  experienceYears: number;
  secondShooterAvailable: boolean;
  engagementSessionIncluded: boolean;
}

export interface DecorationItem {
  id: string;
  name: string;
  description: string;
  category: 'floral' | 'lighting' | 'backdrop' | 'table' | 'ceiling' | 'entrance' | 'centerpiece' | 'other';
  price: number;
  image: string;
}

export interface DecorationPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  includes: string[];
  setupTime: number;
  themes: string[];
}

export interface DecorationVendor extends BaseVendor {
  category: 'decoration';
  styles: string[];
  themes: string[];
  items: DecorationItem[];
  packages: DecorationPackage[];
  setupIncluded: boolean;
  consultationAvailable: boolean;
  customDesignAvailable: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  includes: string[];
}

export interface OtherVendor extends BaseVendor {
  category: 'others';
  subcategory: string;
  services: string[];
  packages: ServicePackage[];
  certifications?: string[];
  insuranceAvailable?: boolean;
}

export type Vendor = CateringVendor | PhotographerVendor | DecorationVendor | OtherVendor;

export interface VendorReview {
  id: string;
  vendorId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  photos?: string[];
  helpful: number;
}

export const VENDOR_CATEGORY_CONFIG: Record<VendorCategory, { 
  label: string; 
  icon: string; 
  description: string;
  color: string;
}> = {
  photographer: {
    label: 'Photographer',
    icon: 'Camera',
    description: 'Capture your special moments',
    color: 'rose',
  },
  catering: {
    label: 'Catering',
    icon: 'UtensilsCrossed',
    description: 'Delicious food for your guests',
    color: 'amber',
  },
  decoration: {
    label: 'Decoration',
    icon: 'Palette',
    description: 'Beautiful venues and setups',
    color: 'violet',
  },
  others: {
    label: 'Others',
    icon: 'Store',
    description: 'More wedding services',
    color: 'blue',
  },
};

export function isCateringVendor(vendor: Vendor): vendor is CateringVendor {
  return vendor.category === 'catering';
}

export function isPhotographerVendor(vendor: Vendor): vendor is PhotographerVendor {
  return vendor.category === 'photographer';
}

export function isDecorationVendor(vendor: Vendor): vendor is DecorationVendor {
  return vendor.category === 'decoration';
}

export function isOtherVendor(vendor: Vendor): vendor is OtherVendor {
  return vendor.category === 'others';
}
