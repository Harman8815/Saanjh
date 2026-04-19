'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid3X3, List } from 'lucide-react';
import CategoryTabs from '../../../components/dashboard/vendors/CategoryTabs';
import VendorCard from '../../../components/dashboard/vendors/VendorCard';
import { Vendor, VendorCategory } from '../../../types/vendor';

// Sample vendors data - in production, this would come from an API
const sampleVendors: Vendor[] = [
  // Photographers
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
    packages: [],
    style: ['Documentary', 'Fine Art', 'Editorial'],
    experienceYears: 8,
    secondShooterAvailable: true,
    engagementSessionIncluded: true,
  },
  {
    id: 'photo-2',
    name: 'Lens & Light Studios',
    category: 'photographer',
    rating: 4.7,
    reviewCount: 89,
    location: 'New York, NY',
    description: 'Documentary-style wedding photography that tells your unique love story through authentic moments.',
    phone: '+1 (212) 555-0456',
    email: 'bookings@lensandlight.com',
    website: 'https://lensandlight.com',
    status: 'available',
    image: '',
    gallery: [],
    pricing: { currency: '$', startingPrice: 2800, priceRange: '$$' },
    specialty: ['Documentary', 'Destination Weddings'],
    equipment: ['Nikon Z9', 'Fujifilm GFX'],
    portfolio: [],
    packages: [],
    style: ['Documentary', 'Natural'],
    experienceYears: 5,
    secondShooterAvailable: true,
    engagementSessionIncluded: false,
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
    menu: [],
    packages: [],
    dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Kosher', 'Halal'],
    serviceStyle: 'plated',
    tastingsAvailable: true,
  },
  {
    id: 'cater-2',
    name: 'Garden Fresh Catering',
    category: 'catering',
    rating: 4.6,
    reviewCount: 156,
    location: 'San Francisco, CA',
    description: 'Farm-to-table catering focusing on organic, locally-sourced ingredients. Sustainable and delicious.',
    phone: '+1 (415) 555-0321',
    email: 'hello@gardenfreshsf.com',
    website: 'https://gardenfreshsf.com',
    status: 'available',
    image: '',
    gallery: [],
    pricing: { currency: '$', startingPrice: 65, priceRange: '$$' },
    cuisine: ['Californian', 'Farm-to-Table', 'Organic'],
    menu: [],
    packages: [],
    dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'],
    serviceStyle: 'buffet',
    tastingsAvailable: true,
  },
  {
    id: 'cater-3',
    name: 'Spice Route Catering',
    category: 'catering',
    rating: 4.9,
    reviewCount: 98,
    location: 'Austin, TX',
    description: 'Authentic flavors from India, Thailand, and Mexico. Bold, vibrant cuisine that will wow your guests.',
    phone: '+1 (512) 555-0654',
    email: 'spice@spiceroutecatering.com',
    website: 'https://spiceroutecatering.com',
    status: 'booked',
    image: '',
    gallery: [],
    pricing: { currency: '$', startingPrice: 55, priceRange: '$$' },
    cuisine: ['Indian', 'Thai', 'Mexican', 'Fusion'],
    menu: [],
    packages: [],
    dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Spice Levels Customizable'],
    serviceStyle: 'family-style',
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
    items: [],
    packages: [],
    setupIncluded: true,
    consultationAvailable: true,
    customDesignAvailable: true,
  },
  {
    id: 'deco-2',
    name: 'Elegant Events Design',
    category: 'decoration',
    rating: 4.5,
    reviewCount: 87,
    location: 'Seattle, WA',
    description: 'Minimalist and elegant event design with a focus on sustainability and eco-friendly materials.',
    phone: '+1 (206) 555-0143',
    email: 'hello@elegante.design',
    website: 'https://elegante.design',
    status: 'available',
    image: '',
    gallery: [],
    pricing: { currency: '$', startingPrice: 1800, priceRange: '$$' },
    styles: ['Minimalist', 'Scandinavian', 'Eco-Friendly'],
    themes: ['Nordic Elegance', 'Green Wedding', 'Modern Simplicity'],
    items: [],
    packages: [],
    setupIncluded: true,
    consultationAvailable: true,
    customDesignAvailable: true,
  },
  
  // Others
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
    packages: [],
    certifications: ['Licensed & Insured', 'Professional Chauffeurs'],
    insuranceAvailable: true,
  },
  {
    id: 'other-2',
    name: 'Harmony Wedding DJ',
    category: 'others',
    rating: 4.7,
    reviewCount: 134,
    location: 'Nashville, TN',
    description: 'Professional DJ services with state-of-the-art sound equipment and lighting. Keeping the dance floor packed!',
    phone: '+1 (615) 555-0509',
    email: 'beats@harmonyweddingdj.com',
    website: 'https://harmonyweddingdj.com',
    status: 'available',
    image: '',
    gallery: [],
    pricing: { currency: '$', startingPrice: 800, priceRange: '$$' },
    subcategory: 'Music & Entertainment',
    services: ['DJ & MC Services', 'Lighting Design', 'Photo Booth', 'Live Musicians'],
    packages: [],
    certifications: ['Licensed & Insured'],
    insuranceAvailable: true,
  },
];

export default function VendorsPage() {
  const [activeCategory, setActiveCategory] = useState<VendorCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<VendorCategory | 'all', number> = { all: sampleVendors.length, photographer: 0, catering: 0, decoration: 0, others: 0 };
    sampleVendors.forEach(vendor => {
      counts[vendor.category]++;
    });
    return counts;
  }, []);

  // Filter vendors based on category and search
  const filteredVendors = useMemo(() => {
    return sampleVendors.filter(vendor => {
      const matchesCategory = activeCategory === 'all' || vendor.category === activeCategory;
      const matchesSearch = 
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            <span className="text-glow">Wedding Vendors</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl">
            Discover and connect with the perfect vendors for your special day
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <CategoryTabs 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={categoryCounts}
          />
        </motion.div>

        {/* Search & Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card p-4 mb-8 rounded-2xl"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors by name, description, or location..."
                className="w-full pl-12 pr-4 py-3 bg-surface border border-white/20 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10'
                }`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-text-muted">
            Showing <span className="text-text-primary font-medium">{filteredVendors.length}</span> vendor{filteredVendors.length !== 1 ? 's' : ''}
            {activeCategory !== 'all' && (
              <span> in <span className="text-primary font-medium capitalize">{activeCategory}</span></span>
            )}
            {searchQuery && (
              <span> matching <span className="text-primary font-medium">&quot;{searchQuery}&quot;</span></span>
            )}
          </p>
        </motion.div>

        {/* Vendor Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }
        >
          {filteredVendors.map((vendor, index) => (
            <VendorCard 
              key={vendor.id} 
              vendor={vendor} 
              index={index}
            />
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredVendors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
              <Filter size={32} className="text-text-muted" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No vendors found</h3>
            <p className="text-text-muted">
              Try adjusting your search or category filter
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
