'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function WeddingPackagesPage() {
  const [selectedPackage, setSelectedPackage] = useState(1);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Mock packages data - ready for API integration
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
                        <Check size={12} className="text-white" />
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

        {/* Package Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass-card p-6 mt-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">Package Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-text-muted font-medium">Features</th>
                  {packages.map((pkg) => (
                    <th key={pkg.id} className="text-center p-4 text-text-muted font-medium">
                      {pkg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-text-primary font-medium">Price (Monthly)</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 text-center text-text-primary">
                      ${pkg.price.monthly}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-text-primary font-medium">Price (Yearly)</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 text-center text-text-primary">
                      ${pkg.price.yearly}/mo
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-text-primary font-medium">Digital Invitations</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 text-center">
                      <Check size={20} className="text-green-500 mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-text-primary font-medium">Advanced Venue Booking</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 text-center">
                      {pkg.id >= 2 ? (
                        <Check size={20} className="text-green-500 mx-auto" />
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-text-primary font-medium">Vendor Directory</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 text-center">
                      {pkg.id >= 2 ? (
                        <Check size={20} className="text-green-500 mx-auto" />
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-text-primary font-medium">Personal Consultant</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 text-center">
                      {pkg.id === 3 ? (
                        <Check size={20} className="text-green-500 mx-auto" />
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-text-primary font-medium">Access Duration</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-4 text-center text-text-primary">
                      {pkg.features.find(f => f.includes('Day'))?.split(' ')[0] || '-'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="glass-card p-6 mt-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                question: "Can I change my package later?",
                answer: "Yes! You can upgrade or downgrade your package at any time. Changes will be prorated."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers for yearly plans."
              },
              {
                question: "Is there a setup fee?",
                answer: "No setup fees for any package. You only pay the monthly or yearly subscription."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Yes, you can cancel your subscription anytime with no cancellation fees."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 14-day money-back guarantee for all new subscriptions."
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-white/10 pb-4 last:border-0">
                <h3 className="text-text-primary font-medium mb-2">{faq.question}</h3>
                <p className="text-text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="glass-card p-6 mt-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">What Our Couples Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah & Michael",
                package: "Premium Package",
                text: "The venue booking feature alone saved us hours of research. Highly recommend!",
                rating: 5
              },
              {
                name: "Emily & James",
                package: "Ultimate Package",
                text: "Our personal consultant was amazing. Made wedding planning stress-free!",
                rating: 5
              },
              {
                name: "Jessica & David",
                package: "Starter Package",
                text: "Perfect for our intimate wedding. Great value for the price!",
                rating: 4
              }
            ].map((testimonial, index) => (
              <div key={index} className="p-4 bg-surface rounded-lg">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-text-muted mb-3 italic">"{testimonial.text}"</p>
                <div>
                  <p className="text-text-primary font-medium">{testimonial.name}</p>
                  <p className="text-text-muted text-sm">{testimonial.package}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
