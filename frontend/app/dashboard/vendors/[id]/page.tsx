'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, MapPin, Phone, Mail, Calendar, Clock, Heart, Share2, Edit } from 'lucide-react';
import Link from 'next/link';
import ContactCard from '../../../components/dashboard/vendors/ContactCard';
import Reviews from '../../../components/dashboard/vendors/Reviews';
import { 
  Vendor, 
  VendorCategory, 
  VENDOR_CATEGORY_CONFIG,
  isCateringVendor,
  isPhotographerVendor,
  isDecorationVendor,
  isOtherVendor
} from '../../../types/vendor';

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
    content: 'From the engagement session to the wedding day, everything was perfect. They were professional, creative, and made us feel comfortable.',
    date: '2024-02-28',
    helpful: 18,
  },
];

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'packages' | 'reviews'>('overview');

  // Find vendor by ID
  const vendor = useMemo(() => {
    return sampleVendors.find(v => v.id === vendorId);
  }, [vendorId]);

  // Filter reviews for this vendor
  const vendorReviews = useMemo(() => {
    return sampleReviews.filter(r => r.vendorId === vendorId);
  }, [vendorId]);

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-primary mb-4">Vendor Not Found</h1>
          <p className="text-text-muted mb-6">The vendor you're looking for doesn't exist.</p>
          <Link href="/dashboard/vendors" className="btn-primary">
            Back to Vendors
          </Link>
        </div>
      </div>
    );
  }

  const config = VENDOR_CATEGORY_CONFIG[vendor.category];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link 
            href="/dashboard/vendors"
            className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Vendors
          </Link>
        </motion.div>

        {/* Vendor Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Vendor Image */}
              <div className="lg:w-1/3">
                <div className="aspect-square bg-surface rounded-2xl overflow-hidden">
                  {vendor.image ? (
                    <img 
                      src={vendor.image} 
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                        <span className="text-5xl text-white font-bold">
                          {vendor.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vendor Info */}
              <div className="lg:w-2/3 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/30`}>
                      {config.label}
                    </span>
                    <div className="flex items-center gap-1 bg-gold/10 px-2 py-1 rounded-lg">
                      <Star size={14} className="text-gold fill-current" />
                      <span className="text-sm font-medium text-gold">{vendor.rating}</span>
                      <span className="text-xs text-text-muted">({vendor.reviewCount})</span>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-text-primary mb-4">{vendor.name}</h1>
                  <p className="text-text-secondary mb-4">{vendor.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin size={16} />
                      {vendor.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={16} />
                      {vendor.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail size={16} />
                      {vendor.email}
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-surface rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted">Starting from</p>
                      <p className="text-2xl font-bold text-primary">
                        {vendor.pricing.currency}{vendor.pricing.startingPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <Heart size={18} className="text-text-muted" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <Share2 size={18} className="text-text-muted" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <a 
                    href={`tel:${vendor.phone}`}
                    className="flex-1 btn-primary text-center py-3"
                  >
                    Contact Now
                  </a>
                  <a 
                    href={`mailto:${vendor.email}`}
                    className="flex-1 btn-secondary text-center py-3"
                  >
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-2 border-b border-white/10">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'portfolio', label: 'Portfolio', show: vendor.category === 'photographer' },
              { id: 'packages', label: 'Packages' },
              { id: 'reviews', label: 'Reviews' },
            ].filter(tab => tab.show !== false).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-primary border-primary'
                    : 'text-text-muted border-transparent hover:text-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2">
                {/* Overview Content based on vendor type */}
                {isCateringVendor(vendor) && (
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Cuisine & Services</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">Cuisine Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.cuisine.map((cuisine: string) => (
                            <span key={cuisine} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                              {cuisine}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">Service Style</h4>
                        <p className="text-text-secondary capitalize">{vendor.serviceStyle}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">Dietary Options</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.dietaryOptions.map((option: string) => (
                            <span key={option} className="px-3 py-1 bg-surface border border-white/20 rounded-full text-sm text-text-muted">
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isPhotographerVendor(vendor) && (
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Photography Services</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">Specialty</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.specialty.map((specialty: string) => (
                            <span key={specialty} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">Style</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.style.map((style: string) => (
                            <span key={style} className="px-3 py-1 bg-surface border border-white/20 rounded-full text-sm text-text-muted">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">Equipment</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.equipment.map((equipment: string) => (
                            <span key={equipment} className="px-3 py-1 bg-surface border border-white/20 rounded-full text-sm text-text-muted">
                              {equipment}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface rounded-lg p-3">
                          <p className="text-sm text-text-muted">Experience</p>
                          <p className="text-lg font-medium text-text-primary">{vendor.experienceYears} years</p>
                        </div>
                        <div className="bg-surface rounded-lg p-3">
                          <p className="text-sm text-text-muted">Second Shooter</p>
                          <p className="text-lg font-medium text-text-primary">
                            {vendor.secondShooterAvailable ? 'Available' : 'Not Available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isDecorationVendor(vendor) && (
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Decoration Services</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">Styles</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.styles.map((style: string) => (
                            <span key={style} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">Themes</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.themes.map((theme: string) => (
                            <span key={theme} className="px-3 py-1 bg-surface border border-white/20 rounded-full text-sm text-text-muted">
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface rounded-lg p-3">
                          <p className="text-sm text-text-muted">Setup Included</p>
                          <p className="text-lg font-medium text-text-primary">
                            {vendor.setupIncluded ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div className="bg-surface rounded-lg p-3">
                          <p className="text-sm text-text-muted">Custom Design</p>
                          <p className="text-lg font-medium text-text-primary">
                            {vendor.customDesignAvailable ? 'Available' : 'Not Available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isOtherVendor(vendor) && (
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Services & Information</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">Category</h4>
                        <p className="text-text-secondary">{vendor.subcategory}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">Services</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.services.map((service: string) => (
                            <span key={service} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                      {vendor.certifications && (
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">Certifications</h4>
                          <div className="flex flex-wrap gap-2">
                            {vendor.certifications.map((cert: string) => (
                              <span key={cert} className="px-3 py-1 bg-surface border border-white/20 rounded-full text-sm text-text-muted">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Card */}
              <div>
                <ContactCard vendor={vendor} />
              </div>
            </motion.div>
          )}

          {activeTab === 'portfolio' && isPhotographerVendor(vendor) && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-6 rounded-2xl"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-6">Portfolio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Portfolio items would go here */}
                <div className="aspect-square bg-surface rounded-lg flex items-center justify-center">
                  <p className="text-text-muted">Portfolio coming soon</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'packages' && (
            <motion.div
              key="packages"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {vendor.packages.map((pkg: any, index: number) => (
                <div key={pkg.id} className="glass-card p-6 rounded-2xl">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-text-primary mb-2">{pkg.name}</h3>
                      <p className="text-text-secondary mb-4">{pkg.description}</p>
                      
                      {/* Package-specific details */}
                      {isCateringVendor(vendor) && (
                        <div className="space-y-2">
                          <p className="text-sm text-text-muted">
                            <span className="font-medium">Price per plate:</span> {vendor.pricing.currency}{(pkg as any).pricePerPlate}
                          </p>
                          <p className="text-sm text-text-muted">
                            <span className="font-medium">Minimum guests:</span> {(pkg as any).minGuests}
                          </p>
                        </div>
                      )}
                      
                      {isPhotographerVendor(vendor) && (
                        <div className="space-y-2">
                          <p className="text-sm text-text-muted">
                            <span className="font-medium">Duration:</span> {(pkg as any).duration} hours
                          </p>
                          <p className="text-sm text-text-muted">
                            <span className="font-medium">Photos:</span> {(pkg as any).deliverables?.editedPhotos} edited
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary mb-4">
                        {vendor.pricing.currency}{pkg.price.toLocaleString()}
                      </p>
                      <button className="btn-primary px-6 py-2">
                        Select Package
                      </button>
                    </div>
                  </div>
                  
                  {/* Package includes */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="font-medium text-text-primary mb-2">Includes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {pkg.includes.map((item: string) => (
                        <span key={item} className="px-3 py-1 bg-surface border border-white/20 rounded-full text-sm text-text-muted">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Reviews reviews={vendorReviews} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
