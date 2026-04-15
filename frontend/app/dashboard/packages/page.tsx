'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function WeddingPackagesPage() {
  const [selectedPackage, setSelectedPackage] = useState(1);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // TODO: Fetch packages from API
  const packages = [
    {
      id: 1,
      name: 'Starter Package',
      price: { monthly: 99, yearly: 89 },
      description: 'Perfect for intimate weddings',
      features: [
        'Digital Invitations',
        'Basic Venue Search',
        'Guest List Manager',
        'Email Support',
        '7-Day Access'
      ],
      popular: false
    },
    {
      id: 2,
      name: 'Premium Package',
      price: { monthly: 299, yearly: 269 },
      description: 'Our most popular choice',
      features: [
        'Everything in Starter',
        'Advanced Venue Booking',
        'Vendor Directory Access',
        'Priority Support',
        '30-Day Access',
        'Budget Tracker'
      ],
      popular: true
    },
    {
      id: 3,
      name: 'Ultimate Package',
      price: { monthly: 599, yearly: 539 },
      description: 'Complete wedding planning solution',
      features: [
        'Everything in Premium',
        'Personal Wedding Consultant',
        'Unlimited Vendor Contacts',
        'Phone & Video Support',
        'Unlimited Access',
        'Advanced Analytics',
        'Custom Website'
      ],
      popular: false
    }
  ];

  const displayPrice = (pkg: typeof packages[0]) => {
    return billingCycle === 'yearly' ? pkg.price.yearly : pkg.price.monthly;
  };

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
            <span className="text-glow">Wedding Packages</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Choose the perfect package for your wedding planning needs
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex justify-center">
            <div className="inline-flex items-center bg-surface rounded-full p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-gold text-white text-xs px-2 py-1 rounded-full">
                  Save 10%
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              className={`relative cursor-pointer rounded-2xl p-1 transition-all duration-300 ${
                selectedPackage === pkg.id
                  ? 'ring-2 ring-primary bg-primary/10'
                  : 'hover:scale-105'
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <div className="glass-card p-6 h-full">
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-3 -right-3 bg-gold text-white text-xs px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                {/* Package Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">{pkg.name}</h3>
                  <p className="text-text-muted mb-4">{pkg.description}</p>
                  <div className="text-3xl font-bold text-primary">
                    ${displayPrice(pkg)}
                    <span className="text-lg text-text-muted font-normal">
                      /{billingCycle}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-text-primary">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button className="w-full btn-primary mt-6">
                  {selectedPackage === pkg.id ? 'Selected' : 'Select Package'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TODO: Add package comparison */}
        {/* TODO: Add custom package builder */}
        {/* TODO: Add FAQ section */}
        {/* TODO: Add testimonials */}
      </div>
    </div>
  );
}
