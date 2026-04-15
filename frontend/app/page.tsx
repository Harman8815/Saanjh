'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import FAQ from '../components/FAQ';
import Pricing from '../components/Pricing';
import ContactForm from '../components/ContactForm';

export default function Home() {
  const { setCurrentPage } = useAppStore();

  const handleNavClick = (page: string) => {
    setCurrentPage(page);
  };

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered',
      description: 'Smart algorithms that understand your relationship and create personalized proposals.',
      delay: 0.1
    },
    {
      icon: '✨',
      title: 'Unique Ideas',
      description: 'Get creative and romantic proposal ideas tailored to your partner\'s preferences.',
      delay: 0.2
    },
    {
      icon: '📝',
      title: 'Perfect Wording',
      description: 'Heartfelt speeches and messages that express your love beautifully.',
      delay: 0.3
    }
  ];

  const floatingElements = [
    { emoji: '💐', delay: 0, duration: 4, x: 10, y: 20 },
    { emoji: '💍', delay: 0.5, duration: 3.5, x: 85, y: 30 },
    { emoji: '🌹', delay: 1, duration: 3, x: 25, y: 70 },
    { emoji: '💕', delay: 1.5, duration: 4.5, x: 80, y: 80 },
    { emoji: '🎀', delay: 2, duration: 3.2, x: 15, y: 40 },
    { emoji: '🌸', delay: 2.5, duration: 3.8, x: 90, y: 60 },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-card">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-highlight/10 animate-pulse" />
        </div>
        
        {/* Floating Elements */}
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl md:text-6xl opacity-30 pointer-events-none"
            style={{ 
              left: `${element.x}%`, 
              top: `${element.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: element.delay
            }}
          >
            {element.emoji}
          </motion.div>
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6">
                Create the Perfect
                <span className="block text-gradient animate-glow">Wedding Experience</span>
              </h1>
              <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-4xl mx-auto leading-relaxed">
                Let AI help you craft the most romantic and personalized wedding journey that will create unforgettable memories.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link
                href="/generator"
                onClick={() => handleNavClick('generator')}
                className="btn-primary text-lg px-8 py-4"
              >
                Start Creating 💕
              </Link>
              <Link
                href="/gallery"
                onClick={() => handleNavClick('gallery')}
                className="btn-secondary text-lg px-8 py-4"
              >
                View Gallery
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Why Choose Perfect Wedding?
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              We combine cutting-edge AI with romantic expertise to create unforgettable moments.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card p-8 text-center group cursor-pointer"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-5xl mb-6 group-hover:animate-glow"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
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
                className="bg-white text-primary px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl"
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
