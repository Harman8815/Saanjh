import { notFound } from 'next/navigation';
import VendorDetailClient from './VendorDetailClient';
import { Vendor } from '../../../../types/vendor';

// Sample vendor data - in production, this would come from an API
const sampleVendors: Vendor[] = [
  // Photographer
  {
    id: 'photo-1',
    name: 'Moments Forever Photography',
    category: 'photographer',
    rating: 4.9,
    reviewCount: 128,
    location: 'Los Angeles, CA',
    description: 'Capturing timeless moments with a blend of candid and artistic photography. Specializing in luxury weddings and engagement shoots.',
    phone: '+1 (310) 555-0123',
    email: 'hello@momentsforever.com',
    website: 'https://momentsforever.com',
    status: 'available',
    image: '',
    gallery: [],
    pricing: { currency: '$', startingPrice: 3500, priceRange: '$$$' },
    specialty: ['Wedding', 'Engagement', 'Editorial'],
    equipment: ['Sony A7R IV', 'Canon EOS R5', 'Drone Photography'],
    portfolio: [],
    packages: [
      {
        id: 'pkg-1',
        name: 'Complete Wedding Package',
        description: 'Full day coverage from getting ready to reception',
        price: 4500,
        duration: 8,
        includes: ['2 Photographers', 'Engagement Session', 'Online Gallery', 'All edited photos'],
        deliverables: { editedPhotos: 800, rawPhotos: 2000, albums: 1 }
      },
      {
        id: 'pkg-2',
        name: 'Essential Package',
        description: 'Ceremony and reception coverage',
        price: 3500,
        duration: 6,
        includes: ['1 Photographer', 'Online Gallery', 'All edited photos'],
        deliverables: { editedPhotos: 600, rawPhotos: 1500 }
      }
    ],
    style: ['Documentary', 'Fine Art', 'Editorial'],
    experienceYears: 8,
    secondShooterAvailable: true,
    engagementSessionIncluded: true,
  },
  // Catering
  {
    id: 'cater-1',
    name: 'Royal Feast Catering',
    category: 'catering',
    rating: 4.8,
    reviewCount: 215,
    location: 'Chicago, IL',
    description: 'Award-winning catering service offering exquisite cuisine from around the world. From intimate gatherings to grand celebrations.',
    phone: '+1 (312) 555-0789',
    email: 'events@royalfeast.com',
    website: 'https://royalfeastcatering.com',
    status: 'available',
    image: '',
    gallery: [],
    pricing: { currency: '$', startingPrice: 85, priceRange: '$$$' },
    cuisine: ['Italian', 'French', 'Mediterranean', 'Indian'],
    menu: [
      {
        id: 'menu-1',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan and house-made croutons',
        price: 12,
        category: 'starter',
        isVegetarian: true,
        serves: 1
      },
      {
        id: 'menu-2',
        name: 'Grilled Salmon',
        description: 'Atlantic salmon with lemon butter sauce and seasonal vegetables',
        price: 28,
        category: 'main',
        isVegetarian: false,
        serves: 1
      },
      {
        id: 'menu-3',
        name: 'Tiramisu',
        description: 'Classic Italian dessert with espresso and mascarpone',
        price: 8,
        category: 'dessert',
        isVegetarian: true,
        serves: 1
      }
    ],
    packages: [
      {
        id: 'pkg-1',
        name: 'Silver Package',
        description: 'Elegant three-course meal with premium ingredients',
        pricePerPlate: 85,
        minGuests: 50,
        includes: ['Appetizers', 'Main Course', 'Dessert', 'Soft Drinks', 'Service Staff'],
        menuItems: ['menu-1', 'menu-2', 'menu-3']
      },
      {
        id: 'pkg-2',
        name: 'Gold Package',
        description: 'Luxury five-course meal with premium ingredients and bar service',
        pricePerPlate: 120,
        minGuests: 75,
        includes: ['Five Course Meal', 'Premium Bar', 'Wedding Cake', 'Service Staff', 'Decor'],
        menuItems: ['menu-1', 'menu-2', 'menu-3']
      }
    ],
    dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Kosher', 'Halal'],
    serviceStyle: 'plated',
    tastingsAvailable: true,
  },
  // Decoration
  {
    id: 'deco-1',
    name: 'Blooming Dreams Decor',
    category: 'decoration',
    rating: 5.0,
    reviewCount: 172,
    location: 'Miami, FL',
    description: 'Luxury floral arrangements and event design that transforms venues into magical spaces.',
    phone: '+1 (305) 555-0987',
    email: 'design@bloomingdreams.com',
    website: 'https://bloomingdreamsdecor.com',
    status: 'available',
    image: '',
    gallery: [],
    pricing: { currency: '$', startingPrice: 2500, priceRange: '$$$' },
    styles: ['Romantic', 'Luxury', 'Garden', 'Modern'],
    themes: ['Classic Romance', 'Boho Chic', 'Glamorous Gold', 'Tropical Paradise'],
    items: [
      {
        id: 'item-1',
        name: 'Rose Arch',
        description: 'Beautiful floral arch for ceremony backdrop',
        category: 'backdrop',
        price: 800,
        image: ''
      },
      {
        id: 'item-2',
        name: 'Centerpiece Set',
        description: '10 table centerpieces with seasonal flowers',
        category: 'centerpiece',
        price: 500,
        image: ''
      }
    ],
    packages: [
      {
        id: 'pkg-1',
        name: 'Complete Wedding Decor',
        description: 'Full venue decoration including ceremony and reception',
        price: 5000,
        includes: ['Ceremony Decor', 'Reception Decor', 'Floral Arrangements', 'Lighting', 'Setup & Removal'],
        setupTime: 8,
        themes: ['Classic Romance', 'Modern Elegance']
      }
    ],
    setupIncluded: true,
    consultationAvailable: true,
    customDesignAvailable: true,
  },
  // Other
  {
    id: 'other-1',
    name: 'VIP Transportation Services',
    category: 'others',
    rating: 4.8,
    reviewCount: 203,
    location: 'Las Vegas, NV',
    description: 'Luxury wedding transportation with a fleet of limousines, vintage cars, and party buses.',
    phone: '+1 (702) 555-0276',
    email: 'bookings@viptranspo.com',
    website: 'https://viptranspo.com',
    status: 'available',
    image: '',
    gallery: [],
    pricing: { currency: '$', startingPrice: 450, priceRange: '$$' },
    subcategory: 'Transportation',
    services: ['Limousine Service', 'Vintage Car Rental', 'Party Bus', 'Guest Shuttle'],
    packages: [
      {
        id: 'pkg-1',
        name: 'Wedding Day Transport',
        description: 'Complete transportation for wedding party and guests',
        price: 1200,
        includes: ['Bride & Groom Transport', 'Wedding Party Transport', 'Guest Shuttle Service', 'Professional Driver']
      }
    ],
    certifications: ['Licensed & Insured', 'Professional Chauffeurs'],
    insuranceAvailable: true,
  },
];

// Sample reviews data
const sampleReviews = [
  {
    id: '1',
    vendorId: 'photo-1',
    userName: 'Sarah Johnson',
    rating: 5,
    title: 'Absolutely Stunning Photos!',
    content: 'Moments Forever captured our wedding day perfectly. The photos are breathtaking and they really captured the emotion of the day. Highly recommend!',
    date: '2024-03-15',
    helpful: 24,
  },
  {
    id: '2',
    vendorId: 'photo-1',
    userName: 'Michael Chen',
    rating: 5,
    title: 'Professional and Talented',
    content: 'From engagement session to wedding day, everything was perfect. They were professional, creative, and made us feel comfortable.',
    date: '2024-02-28',
    helpful: 18,
  },
];

// Generate static params for static export
export async function generateStaticParams() {
  const vendorIds = [
    'photo-1',
    'photo-2',
    'cater-1',
    'cater-2',
    'cater-3',
    'deco-1',
    'deco-2',
    'other-1',
    'other-2'
  ];
  
  return vendorIds.map((id) => ({
    id: id,
  }));
}

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = sampleVendors.find(v => v.id === id);
  const vendorReviews = sampleReviews.filter(r => r.vendorId === id);

  if (!vendor) {
    notFound();
  }

  return <VendorDetailClient vendor={vendor} vendorReviews={vendorReviews} />;
}
