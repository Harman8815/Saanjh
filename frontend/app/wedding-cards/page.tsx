'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, Camera, Share2, BarChart3, Edit, Eye, Users, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { DataLoadingState, EmptyState } from '../../components/ui/loading-states';
import WeddingCardService from '../../services/weddingCards';
import { useWeddingCardAnalytics } from '../../hooks/useWeddingCards';
import { WeddingCard } from '../../types/api';

interface CardTemplate {
  id: number;
  name: string;
  category: string;
  preview: string;
  features: string[];
  popularity: number;
}

// Live analytics badge for a single wedding card
function CardAnalyticsBadge({ cardId }: { cardId: number }) {
  const { analytics, isLoading } = useWeddingCardAnalytics(cardId);

  if (isLoading) {
    return <Loader2 size={14} className="animate-spin text-text-secondary" />;
  }

  if (!analytics) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-text-secondary">
      <span className="flex items-center gap-1">
        <Eye size={12} />
        {analytics.total_views} views
      </span>
      <span className="flex items-center gap-1">
        <Users size={12} />
        {analytics.total_rsvps} RSVPs
      </span>
      {analytics.total_photos_uploaded > 0 && (
        <span className="flex items-center gap-1">
          <Camera size={12} />
          {analytics.total_photos_uploaded}
        </span>
      )}
    </div>
  );
}

export default function WeddingCardsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Real card data from the API: the template gallery below is static product
  // content, but "Your Wedding Cards" is user data.
  const [cards, setCards] = useState<WeddingCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCards() {
      setCardsLoading(true);
      setCardsError(null);
      try {
        const response = await WeddingCardService.getWeddingCards();
        if (cancelled) return;
        // The list endpoint returns a paginated envelope.
        setCards(Array.isArray(response) ? response : response.results ?? []);
      } catch (err) {
        if (cancelled) return;
        setCardsError(
          err instanceof Error ? err : new Error('Could not load your wedding cards')
        );
      } finally {
        if (!cancelled) setCardsLoading(false);
      }
    }

    loadCards();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mock card templates data - ready for API integration
  const cardTemplates: CardTemplate[] = [
    { 
      id: 1, 
      name: 'Classic Romance', 
      category: 'Traditional',
      preview: 'classic-romance',
      features: ['Elegant Design', 'Gold Accents', 'Traditional Fonts'],
      popularity: 95
    },
    { 
      id: 2, 
      name: 'Modern Minimal', 
      category: 'Contemporary',
      preview: 'modern-minimal',
      features: ['Clean Lines', 'Minimal Design', 'Modern Fonts'],
      popularity: 88
    },
    { 
      id: 3, 
      name: 'Garden Party', 
      category: 'Outdoor',
      preview: 'garden-party',
      features: ['Floral Elements', 'Nature Theme', 'Soft Colors'],
      popularity: 92
    },
    { 
      id: 4, 
      name: 'Beach Sunset', 
      category: 'Destination',
      preview: 'beach-sunset',
      features: ['Ocean Theme', 'Sunset Colors', 'Tropical Elements'],
      popularity: 85
    },
    { 
      id: 5, 
      name: 'Vintage Elegance', 
      category: 'Vintage',
      preview: 'vintage-elegance',
      features: ['Ornate Design', 'Classic Fonts', 'Antique Style'],
      popularity: 90
    },
    { 
      id: 6, 
      name: 'Floral Dreams', 
      category: 'Romantic',
      preview: 'floral-dreams',
      features: ['Floral Patterns', 'Soft Colors', 'Romantic Fonts'],
      popularity: 87
    },
  ];

  const categories = ['all', 'Traditional', 'Contemporary', 'Outdoor', 'Destination', 'Vintage', 'Romantic'];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? cardTemplates 
    : cardTemplates.filter(t => t.category === selectedCategory);

  const formatCardDate = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
  };

  
  return (
    <div className="min-h-screen bg-background">
      {/* Wedding Cards Header with Creation Options */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Digital Wedding Cards
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            Create beautiful, shareable digital wedding invitations
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Create New Card
          </button>
        </motion.div>

        {/* Card Creation Options */}
        <div className="mb-12">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Choose Template
                </h3>
                <p className="text-text-secondary">
                  Select from our beautiful collection of professionally designed card templates
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Customize
                </h3>
                <p className="text-text-secondary">
                  Personalize with your photos, text, colors, and unique design preferences
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Share & Track
                </h3>
                <p className="text-text-secondary">
                  Share with guests via email, SMS, or social media and track RSVPs in real-time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Template Gallery */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              Choose a Template
            </h2>
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-white/20 text-text-primary hover:bg-white/5'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="glass-card p-6 hover:transform hover:scale-105 transition-transform">
                <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
                  <div className="relative z-10 text-center">
                    <Heart size={32} className="text-purple-500 mx-auto mb-2" />
                    <span className="text-lg font-semibold text-gray-800">{template.name}</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full">
                      <Star size={12} className="text-yellow-500" />
                      <span className="text-xs font-medium">{template.popularity}%</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {template.name}
                </h3>
                <p className="text-text-secondary mb-4">
                  {template.category}
                </p>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature, index) => (
                      <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <Link href={`/wedding-cards/new?template=${template.id}`}>
                  <button className="btn-primary w-full">
                    Use This Template
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* User's Saved Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Your Wedding Cards ({cards.length})
          </h2>
          <DataLoadingState
            loading={cardsLoading}
            error={cardsError}
            skeleton={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="glass-card p-6 animate-pulse">
                    <div className="h-64 bg-white/10 rounded-lg mb-4" />
                    <div className="h-5 bg-white/10 rounded w-2/3 mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-white/10 rounded" />
                      <div className="h-3 bg-white/10 rounded w-4/5" />
                      <div className="h-3 bg-white/10 rounded w-3/5" />
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            {cards.length === 0 ? (
              <EmptyState
                title="No wedding cards yet"
                description="Choose a template above to create your first digital invitation."
                icon={<Heart className="text-primary" size={24} />}
                action={
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Create New Card
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards.map((card) => (
                  <div key={card.id} className="glass-card p-6">
                    <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
                      <div className="relative z-10 text-center p-4">
                        <Heart size={32} className="text-purple-500 mx-auto mb-2" />
                        <h4 className="text-lg font-semibold text-gray-800">{card.couple_names}</h4>
                        <p className="text-sm text-gray-600">{card.wedding_details}</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      Template {card.template}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Guest photos</span>
                        <span className="text-text-primary font-medium">
                          {card.allow_guest_photos ? 'Allowed' : 'Off'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">RSVP required</span>
                        <span className="text-text-primary font-medium">
                          {card.require_rsvp ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Created</span>
                        <span className="text-text-primary font-medium">
                          {formatCardDate(card.created_at)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <CardAnalyticsBadge cardId={card.id} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/wedding-cards/${card.id}`} className="flex-1">
                        <button className="btn-secondary w-full flex items-center justify-center gap-1">
                          <Eye size={16} />
                          View
                        </button>
                      </Link>
                      <Link href={`/invitation-preview/${card.id}`} className="flex-1">
                        <button className="btn-secondary w-full flex items-center justify-center gap-1">
                          <Share2 size={16} />
                          Preview
                        </button>
                      </Link>
                      <Link href={`/wedding-cards/${card.id}`} className="flex-1">
                        <button className="btn-primary w-full flex items-center justify-center gap-1">
                          <Edit size={16} />
                          Edit
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DataLoadingState>
        </div>

        {/* Card Features and Benefits */}
        <div className="mb-12">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Features & Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Shareable Links</h3>
                <p className="text-text-secondary">
                  Unique, customizable links for each invitation with QR code generation
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">RSVP Tracking</h3>
                <p className="text-text-secondary">
                  Real-time guest response tracking with automatic reminders and follow-ups
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Photo Upload</h3>
                <p className="text-text-secondary">
                  Add your personal photos with easy upload and image editing tools
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Analytics</h3>
                <p className="text-text-secondary">
                  Track engagement, views, and RSVP rates with detailed analytics dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6">Create New Wedding Card</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-text-primary mb-3 font-medium">Choose Template</label>
                <div className="grid grid-cols-2 gap-4">
                  {cardTemplates.slice(0, 4).map((template) => (
                    <div key={template.id} className="border border-white/20 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                      <div className="h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded mb-2 flex items-center justify-center">
                        <Heart size={24} className="text-purple-500" />
                      </div>
                      <h4 className="font-medium text-text-primary">{template.name}</h4>
                      <p className="text-sm text-text-secondary">{template.category}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-text-primary mb-3 font-medium">Card Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 border border-white/20 rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-medium text-text-primary">Main Invitation</h4>
                    <p className="text-sm text-text-secondary">Primary wedding invitation</p>
                  </button>
                  <button className="p-4 border border-white/20 rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-medium text-text-primary">Save the Date</h4>
                    <p className="text-sm text-text-secondary">Early announcement card</p>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Link href="/wedding-cards/new" className="flex-1">
                <button className="btn-primary w-full">Start Creating</button>
              </Link>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
