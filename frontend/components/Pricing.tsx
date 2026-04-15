'use client';

import { useState } from 'react';

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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Flexible pricing options to create your dream proposal
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors relative ${
                billingCycle === 'yearly'
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                plan.popular ? 'ring-2 ring-pink-500 transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center py-2 text-sm font-semibold">
                  Most Popular Choice
                </div>
              )}

              <div className="p-8 pt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      ${calculatePrice(plan)}
                    </span>
                    <span className="text-gray-500 ml-2">/{billingCycle === 'monthly' ? 'month' : 'month (billed yearly)'}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="text-green-600 text-sm mt-1">
                      Save {calculateSavings(plan)}% with yearly billing
                    </div>
                  )}
                </div>

                <button
                  className={`w-full py-3 px-6 rounded-full font-semibold transition-colors mb-8 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.buttonText}
                </button>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <span className="text-green-500 mr-3 mt-0.5">✓</span>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.notIncluded.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start opacity-50">
                      <span className="text-gray-400 mr-3 mt-0.5">○</span>
                      <span className="text-gray-500 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              30-Day Money-Back Guarantee
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors">
                Start Free Trial
              </button>
              <button className="bg-white text-pink-600 border-2 border-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition-colors">
                Compare Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
