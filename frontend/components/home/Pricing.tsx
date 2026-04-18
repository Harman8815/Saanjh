'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TraditionalWeddingCard from '../ui/TraditionalWeddingCard';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Starter',
      price: { monthly: 9, yearly: 7 },
      description: 'Perfect for simple, intimate weddings',
      features: [
        'Basic venue search',
        'Digital wedding cards',
        'Email support',
        '7-day access'
      ],
      popular: false,
      buttonText: 'Get Started'
    },
    {
      name: 'Premium',
      price: { monthly: 29, yearly: 23 },
      description: 'Our most popular choice for memorable weddings',
      features: [
        'Advanced venue search',
        'Unlimited wedding cards',
        'Vendor recommendations',
        'Priority email support',
        '30-day access'
      ],
      popular: true,
      buttonText: 'Most Popular'
    },
    {
      name: 'Ultimate',
      price: { monthly: 79, yearly: 59 },
      description: 'For the ultimate, once-in-a-lifetime wedding',
      features: [
        'Premium venue search',
        'Unlimited everything',
        '1-on-1 consultation',
        'Vendor management',
        'Custom location scouting',
        'Phone & video support',
        'Unlimited access',
        'Wedding day assistance'
      ],
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
          <div className="inline-flex items-center glass-card p-1 relative">
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
              className={`px-8 py-2 rounded-full text-sm font-medium transition-colors relative ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Yearly
              <span className="absolute -top-3 -right-3 bg-gold text-white text-xs px-3 py-1 rounded-full shadow-lg">
                Save 20%
              </span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <TraditionalWeddingCard
              key={index}
              title={plan.name}
              description={plan.description}
              icon={plan.name === 'Starter' ? '💐' : plan.name === 'Premium' ? '💒' : '👰'}
              features={plan.features}
              isSelected={plan.popular}
              onClick={() => console.log(`Selected ${plan.name} plan`)}
              primaryAction={{
                text: plan.buttonText,
                onClick: () => console.log(`${plan.name} plan selected`)
              }}
              secondaryAction={
                plan.popular ? {
                  text: "View Details",
                  onClick: () => console.log(`View ${plan.name} details`)
                } : undefined
              }
            />
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
