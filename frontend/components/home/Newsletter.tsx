'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              <span className="text-glow">Romantic Insights</span> & Exclusive Ideas
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
              Join our newsletter for curated proposal ideas, relationship guidance, and special offers delivered to your inbox.
            </p>
          </motion.div>
        </div>
        
        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-6 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-6 py-4 glass-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe Now'}
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-8 max-w-md mx-auto text-center"
          >
            <div className="text-6xl mb-6">💌</div>
            <h3 className="text-2xl font-semibold text-text-primary mb-4">Welcome to the Family!</h3>
            <p className="text-text-muted leading-relaxed">
              Thank you for subscribing! Check your email for exclusive wedding insights and special offers.
            </p>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-text-muted"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gold/20" />
            <span>Weekly wedding insights</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-bronze/20" />
            <span>Relationship guidance</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-champagne/20" />
            <span>Exclusive offers</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-dusty-rose/20" />
            <span>No spam, unsubscribe anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
