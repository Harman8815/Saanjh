import VenueDetailClient from './VenueDetailClient';

// Generate static params for all venues
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
  ];
}

// Extended venue data with more details
const venuesData = [
  {
    id: 1,
    name: 'Grand Ballroom',
    type: 'ballroom',
    capacity: 200,
    price: 5000,
    location: 'Downtown',
    address: '123 Main Street, Downtown District, City 10001',
    rating: 4.8,
    reviewCount: 127,
    images: [
      '/api/placeholder/venue/1.jpg',
      '/api/placeholder/venue/1b.jpg',
      '/api/placeholder/venue/1c.jpg',
      '/api/placeholder/venue/1d.jpg',
    ],
    amenities: ['Parking', 'Catering Kitchen', 'Dance Floor', 'AV Equipment', 'Wheelchair Accessible', 'Bridal Suite', 'Bar Area'],
    description: 'Experience the pinnacle of elegance at our Grand Ballroom. With soaring 20-foot ceilings, crystal chandeliers, and marble floors, this venue offers an unforgettable setting for your special day. The space features floor-to-ceiling windows with stunning city views and can be configured to accommodate intimate gatherings or grand celebrations.',
    features: ['20ft ceilings', 'Crystal chandeliers', 'Marble floors', 'City views', 'Climate controlled', 'Soundproof'],
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'events@grandballroom.com',
      website: 'www.grandballroom.com'
    },
    available: true,
    reviews: [
      { id: 1, name: 'Sarah & Michael', rating: 5, date: '2024-12-15', text: 'Absolutely stunning venue! The staff was incredibly helpful and the ballroom was breathtaking.' },
      { id: 2, name: 'Jessica & David', rating: 5, date: '2024-11-20', text: 'Perfect for our winter wedding. The chandeliers created such a magical atmosphere.' },
      { id: 3, name: 'Emily & James', rating: 4, date: '2024-10-08', text: 'Beautiful space, professional service. Would highly recommend!' }
    ]
  },
  {
    id: 2,
    name: 'Garden Pavilion',
    type: 'outdoor',
    capacity: 150,
    price: 3500,
    location: 'Riverside Gardens',
    address: '456 Garden Lane, Riverside Gardens, City 10002',
    rating: 4.9,
    reviewCount: 89,
    images: [
      '/api/placeholder/venue/2.jpg',
      '/api/placeholder/venue/2b.jpg',
      '/api/placeholder/venue/2c.jpg',
      '/api/placeholder/venue/2d.jpg',
    ],
    amenities: ['Garden Setting', 'Tent Coverage', 'Restrooms', 'Parking', 'Outdoor Lighting', 'Flower Gardens', 'Water Feature'],
    description: 'Nestled in the heart of Riverside Gardens, our Garden Pavilion offers a romantic outdoor setting surrounded by blooming flowers and lush greenery. The elegant tent structure provides weather protection while maintaining the open-air feeling. A charming water feature and winding garden paths create the perfect backdrop for your ceremony and reception.',
    features: ['Seasonal flowers', 'Water fountain', 'String lighting', 'Garden paths', 'Covered pavilion', 'Sunset views'],
    contact: {
      phone: '+1 (555) 234-5678',
      email: 'bookings@gardenpavilion.com',
      website: 'www.gardenpavilion.com'
    },
    available: true,
    reviews: [
      { id: 1, name: 'Rachel & Tom', rating: 5, date: '2024-09-12', text: 'The garden was in full bloom for our spring wedding. Pictures came out amazing!' },
      { id: 2, name: 'Lisa & Mark', rating: 5, date: '2024-08-30', text: 'Dream venue for nature lovers. The sunset views were incredible.' }
    ]
  },
  {
    id: 3,
    name: 'Historic Mansion',
    type: 'mansion',
    capacity: 100,
    price: 8000,
    location: 'Old Town',
    address: '789 Heritage Avenue, Old Town, City 10003',
    rating: 4.7,
    reviewCount: 64,
    images: [
      '/api/placeholder/venue/3.jpg',
      '/api/placeholder/venue/3b.jpg',
      '/api/placeholder/venue/3c.jpg',
      '/api/placeholder/venue/3d.jpg',
    ],
    amenities: ['Historic Charm', 'Vintage Decor', 'Photo Spots', 'Library', 'Wine Cellar', 'Grand Staircase', 'Fireplace'],
    description: 'Step back in time at our meticulously restored Historic Mansion. Built in 1890, this architectural gem features original hardwood floors, ornate fireplaces, and a grand staircase perfect for dramatic entrances. The elegant library and vintage wine cellar offer unique spaces for intimate gatherings. Every corner tells a story, making your wedding truly timeless.',
    features: ['1890 architecture', 'Original fireplaces', 'Grand staircase', 'Antique furniture', 'Wine cellar', 'Library'],
    contact: {
      phone: '+1 (555) 345-6789',
      email: 'events@historicmansion.com',
      website: 'www.historicmansion.com'
    },
    available: false,
    reviews: [
      { id: 1, name: 'Amanda & Chris', rating: 5, date: '2024-07-20', text: 'Felt like a fairy tale! The historic details are incredible.' },
      { id: 2, name: 'Nicole & Ryan', rating: 4, date: '2024-06-15', text: 'Beautiful venue but parking was challenging. Still worth it!' }
    ]
  },
  {
    id: 4,
    name: 'Beach Resort',
    type: 'beach',
    capacity: 300,
    price: 6000,
    location: 'Sunset Beach',
    address: '321 Ocean Drive, Sunset Beach, City 10004',
    rating: 4.6,
    reviewCount: 156,
    images: [
      '/api/placeholder/venue/4.jpg',
      '/api/placeholder/venue/4b.jpg',
      '/api/placeholder/venue/4c.jpg',
      '/api/placeholder/venue/4d.jpg',
    ],
    amenities: ['Ocean View', 'Beach Access', 'Event Planning', 'Resort Facilities', 'Pool Access', 'Spa Services', 'Beachfront Ceremony'],
    description: 'Say "I do" with your toes in the sand at our exclusive Beach Resort. This oceanfront paradise offers direct beach access for ceremonies, a grand ballroom for receptions, and resort amenities for your guests. The venue includes professional event planning services, spa treatments for the wedding party, and breathtaking sunset views over the Pacific.',
    features: ['Private beach', 'Oceanfront ceremony', 'Resort spa', 'Guest accommodations', 'Sunset views', 'Water sports'],
    contact: {
      phone: '+1 (555) 456-7890',
      email: 'weddings@beachresort.com',
      website: 'www.beachresort.com'
    },
    available: true,
    reviews: [
      { id: 1, name: 'Megan & Alex', rating: 5, date: '2024-11-10', text: 'Beach wedding dreams come true! The resort took care of everything.' },
      { id: 2, name: 'Katie & Ben', rating: 4, date: '2024-10-05', text: 'Gorgeous location. Weather was perfect for our October wedding.' }
    ]
  }
];

interface PageProps {
  params: { id: string };
}

export default function VenueDetailPage({ params }: PageProps) {
  const { id } = params;
  const venueId = parseInt(id);
  const venue = venuesData.find(v => v.id === venueId);

  if (!venue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Venue Not Found</h1>
          <p className="text-text-muted mb-6">The venue you are looking for does not exist.</p>
          <a href="/dashboard/venues" className="btn-primary inline-block">
            Back to Venues
          </a>
        </div>
      </div>
    );
  }

  return <VenueDetailClient venue={venue} />;
}
