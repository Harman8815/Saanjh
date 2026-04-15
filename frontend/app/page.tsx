'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import FAQ from '../components/FAQ';
import Pricing from '../components/Pricing';
import ContactForm from '../components/ContactForm';
import LuxuryWeddingCard from '../components/ui-cards/LuxuryWeddingCard';
import LuxuryWeddingCard from '../components/LuxuryWeddingCard';

export default function Home() {
  const { setCurrentPage } = useAppStore();

  const handleNavClick = (page: string) => {
    setCurrentPage(page);
  };

  const coreFeatures = [
    {
      icon: '🏰',
      title: 'Venue Booking',
      description: 'Discover and book the perfect venue for your dream wedding with detailed information and availability.',
      delay: 0.1
    },
    {
      icon: '💳',
      title: 'Digital Wedding Cards',
      description: 'Create beautiful, shareable digital wedding cards with customization and personal touches.',
      delay: 0.2
    },
    {
      icon: '🛍️',
      title: 'Vendor Marketplace',
      description: 'Connect with trusted vendors - photographers, florists, caterers, and more.',
      delay: 0.3
    }
  ];

  const planningFeatures = [
    {
      icon: '📅',
      title: 'Timeline Planner',
      description: 'Organize your wedding journey with an intuitive drag-and-drop timeline.',
      delay: 0.1
    },
    {
      icon: '💰',
      title: 'Budget Tracker',
      description: 'Manage expenses, track spending, and visualize your wedding budget.',
      delay: 0.2
    },
    {
      icon: '👥',
      title: 'Guest List Manager',
      description: 'Import, organize, and manage your guest list with RSVP tracking.',
      delay: 0.3
    }
  ];

  const customizationFeatures = [
    {
      icon: '💌',
      title: 'Invitation Templates',
      description: 'Choose from elegant templates or design custom invitations.',
      delay: 0.1
    },
    {
      icon: '�',
      title: 'Couple Story Builder',
      description: 'Share your love story with timeline, photos, and personal messages.',
      delay: 0.2
    },
    {
      icon: '🎵',
      title: 'Music Integration',
      description: 'Create playlists and set the perfect soundtrack for your celebration.',
      delay: 0.3
    }
  ];

  const ambientBlobs = [
    { type: 'blob-1', delay: 0, duration: 8, x: 10, y: 20 },
    { type: 'blob-2', delay: 2, duration: 10, x: 85, y: 30 },
    { type: 'blob-3', delay: 4, duration: 12, x: 25, y: 70 },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="min-h-[85vh] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {/* Ambient Blobs */}
          {ambientBlobs.map((blob, index) => (
            <div
              key={index}
              className={`ambient-blob blob-${blob.type}`}
              style={{
                left: `${blob.x}%`,
                top: `${blob.y}%`,
                animationDelay: `${blob.delay}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-text-primary mb-8 leading-tight">
                <span className="block text-glow">Your Perfect Wedding</span>
                <span className="block text-2xl md:text-3xl text-text-secondary font-light mt-2">Elegantly Planned, Beautifully Executed</span>
              </h1>
              <p className="text-lg md:text-xl text-text-muted mb-16 max-w-3xl mx-auto leading-relaxed">
                Transform your wedding dreams into reality with our intelligent planning platform. From venue booking to vendor coordination, we handle every detail with precision and care.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link
                href="/venues"
                onClick={() => handleNavClick('venues')}
                className="btn-primary text-lg px-8 py-4"
              >
                Start Planning
              </Link>
              <Link
                href="/wedding-cards"
                onClick={() => handleNavClick('wedding-cards')}
                className="btn-secondary text-lg px-8 py-4"
              >
                Explore Features
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              <span className="text-glow">Core Wedding Features</span>
            </h2>
            <p className="text-xl text-text-muted max-w-4xl mx-auto leading-relaxed">
              Everything you need to plan the perfect wedding, all in one intelligent platform.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <LuxuryWeddingCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                primaryAction={{
                  text: "Learn More",
                  href: "/features"
                }}
                secondaryAction={{
                  text: "View Demo",
                  href: "/demo"
                }}
                tags={["Wedding", "Premium"]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Planning & Management Section */}
      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              <span className="text-glow-secondary">Smart Planning Tools</span>
            </h2>
            <p className="text-xl text-text-muted max-w-4xl mx-auto leading-relaxed">
              Organize every detail with our intelligent planning and management suite.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {planningFeatures.map((feature, index) => (
              <LuxuryWeddingCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                primaryAction={{
                  text: "Start Planning",
                  href: "/planning"
                }}
                secondaryAction={{
                  text: "View Guide",
                  href: "/guide"
                }}
                tags={["Planning", "Smart Tools"]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Customization & Experience Section */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              <span className="text-glow">Personalization & Experience</span>
            </h2>
            <p className="text-xl text-text-muted max-w-4xl mx-auto leading-relaxed">
              Make your wedding uniquely yours with customization and experience features.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {customizationFeatures.map((feature, index) => (
              <LuxuryWeddingCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                primaryAction={{
                  text: "Customize Now",
                  href: "/customize"
                }}
                secondaryAction={{
                  text: "View Templates",
                  href: "/templates"
                }}
                tags={["Custom", "Personalization"]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Pricing Section */}
      <Pricing />

      {/* FAQ Section */}
      <FAQ />

      {/* Newsletter Section */}
      <Newsletter />

      {/* Contact Form Section */}
      <ContactForm />

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-highlight relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Create Your Perfect Moment?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Join thousands of couples who have created magical wedding experiences with our help.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/generator"
                onClick={() => handleNavClick('generator')}
                className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                Get Started Now
              </Link>
              <Link
                href="#contact"
                onClick={() => handleNavClick('contact')}
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-primary transition-all duration-300"
              >
                Talk to Expert
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
