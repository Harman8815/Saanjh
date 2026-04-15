'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Starter',
      price: { monthly: 9, yearly: 7 },
      description: 'Perfect for simple, intimate proposals',
      features: [
        'Basic AI proposal ideas',
        '3 proposal suggestions',
        'Simple speech generator',
        'Email support',
        '7-day access'
      ],
      notIncluded: [
        'Vendor recommendations',
        'Custom location suggestions',
        'Priority support',
        'Unlimited revisions'
      ],
      popular: false,
      buttonText: 'Get Started'
    },
    {
      name: 'Romantic',
      price: { monthly: 29, yearly: 23 },
      description: 'Our most popular choice for memorable proposals',
      features: [
        'Advanced AI proposal ideas',
        'Unlimited proposal suggestions',
        'Personalized speech generator',
        'Vendor recommendations',
        'Location suggestions',
        'Priority email support',
        '30-day access'
      ],
      notIncluded: [
        '1-on-1 consultation',
        'Photography coordination',
        'Unlimited access'
      ],
      popular: true,
      buttonText: 'Most Popular'
    },
    {
      name: 'Ultimate',
      price: { monthly: 79, yearly: 59 },
      description: 'For the ultimate, once-in-a-lifetime proposal',
      features: [
        'Premium AI proposal ideas',
        'Unlimited everything',
        '1-on-1 consultation',
        'Photography coordination',
        'Vendor management',
        'Custom location scouting',
        'Phone & video support',
        'Unlimited access',
        'Proposal day assistance'
      ],
      notIncluded: [],
      popular: false,
      buttonText: 'Go Premium'
    }
  ];

  const calculatePrice = (plan: typeof plans[0]) => {
    return billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
  };

  const calculateSavings = (plan: typeof plans[0]) => {
    if (billingCycle === 'yearly') {
      const monthlyTotal = plan.price.monthly * 12;
      const yearlyTotal = plan.price.yearly * 12;
      return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
    }
    return 0;
  };

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            <span className="text-glow">Choose Your Perfect Wedding Plan</span>
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed mb-8">
            Flexible pricing options to create your dream wedding experience
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center glass-card p-1">
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
                Save 20%
              </span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative glass-card overflow-hidden hover:border-primary/20 ${
                plan.popular ? 'ring-2 ring-primary transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-highlight text-white text-center py-2 text-sm font-semibold">
                  Most Popular Choice
                </div>
              )}
              
              <div className="p-8 pt-12">
                <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
                <p className="text-text-secondary mb-6 leading-relaxed">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-text-primary">
                      ${calculatePrice(plan)}
                    </span>
                    <span className="text-text-muted ml-2">/{billingCycle === 'monthly' ? 'month' : 'month (billed yearly)'}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="text-gold text-sm mt-1">
                      Save {calculateSavings(plan)}% with yearly billing
                    </div>
                  )}
                </div>
                
                <button
                  className={`btn-primary w-full mb-8 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-highlight hover:from-primary-dark hover:to-highlight-dark'
                      : 'bg-white/10 text-text-primary hover:bg-white/20'
                  }`}
                >
                  {plan.buttonText}
                </button>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-text-primary mb-3">What's included:</h4>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-gold/20 mr-3 mt-0.5" />
                      <span className="text-text-secondary text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.notIncluded.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start opacity-50">
                      <div className="w-2 h-2 rounded-full bg-text-muted/20 mr-3 mt-0.5" />
                      <span className="text-text-muted text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-text-primary mb-6">
              <span className="text-glow-secondary">30-Day Satisfaction Guarantee</span>
            </h3>
            <p className="text-lg text-text-muted mb-8 leading-relaxed">
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="btn-primary">
                Start Free Trial
              </button>
              <button className="btn-secondary">
                Compare Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
