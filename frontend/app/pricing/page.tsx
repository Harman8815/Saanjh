'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

// TODO: Create comprehensive pricing and subscription plans page
// TODO: Add tier comparison features
// TODO: Implement subscription upgrade/downgrade functionality
// TODO: Add payment processing integration
// TODO: Create trial and promotional offers
// TODO: Add enterprise/custom plans
// TODO: Implement billing management and history
// TODO: Add usage analytics and limits

export default function PricingPage() {
  const { user, setCurrentPage } = useAppStore();

  // TODO: Fetch pricing plans and user subscription
  // TODO: Load billing history and usage data
  // TODO: Get promotional offers and trials
  // TODO: Implement plan comparison logic

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$9',
      period: '/month',
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
      id: 'romantic',
      name: 'Romantic',
      price: '$29',
      period: '/month',
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
      id: 'ultimate',
      name: 'Ultimate',
      price: '$79',
      period: '/month',
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* TODO: Add pricing header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Flexible pricing options to create your dream proposal
          </p>
        </motion.div>

        {/* TODO: Add billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="glass-card p-1 inline-flex">
            <button className="px-6 py-2 rounded-lg text-sm font-medium transition-colors bg-primary text-white">
              Monthly
            </button>
            <button className="px-6 py-2 rounded-lg text-sm font-medium transition-colors text-text-secondary hover:text-text-primary">
              Yearly (Save 20%)
            </button>
          </div>
        </motion.div>

        {/* TODO: Add pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              className={`glass-card p-8 relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-text-secondary">{plan.period}</span>
                </div>
                <p className="text-text-secondary">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-semibold text-text-primary mb-4">
                  What&apos;s included:
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-500 mr-3 mt-0.5">TODO: Check</span>
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, i) => (
                    <li key={i} className="flex items-start opacity-50">
                      <span className="text-gray-500 mr-3 mt-0.5">TODO: Empty</span>
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                plan.popular
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-surface text-text-primary hover:bg-white/10'
              }`}>
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* TODO: Add feature comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="glass-card p-8 mb-16"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
            Compare All Features
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-text-primary">Feature</th>
                  <th className="text-center p-4 text-text-primary">Starter</th>
                  <th className="text-center p-4 text-text-primary">Romantic</th>
                  <th className="text-center p-4 text-text-primary">Ultimate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  'AI Proposal Ideas',
                  'Speech Generator',
                  'Vendor Recommendations',
                  'Priority Support',
                  '1-on-1 Consultation',
                  'Photography Coordination',
                  'Unlimited Access'
                ].map((feature, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="p-4 text-text-secondary">{feature}</td>
                    <td className="p-4 text-center">
                      <span className="text-primary">TODO: Icon</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-primary">TODO: Icon</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-primary">TODO: Icon</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* TODO: Add FAQ section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="glass-card p-8 mb-16"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: 'Can I change my plan later?',
                answer: 'TODO: Yes, you can upgrade or downgrade your plan at any time.'
              },
              {
                question: 'Is there a free trial?',
                answer: 'TODO: Yes, we offer a 7-day free trial for all plans.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'TODO: We accept all major credit cards and PayPal.'
              },
              {
                question: 'Can I cancel anytime?',
                answer: 'TODO: Yes, you can cancel your subscription at any time.'
              }
            ].map((faq, i) => (
              <div key={i} className="border-b border-white/10 pb-4">
                <h4 className="text-text-primary font-semibold mb-2">
                  {faq.question}
                </h4>
                <p className="text-text-secondary">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* TODO: Add money-back guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="glass-card p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            30-Day Money-Back Guarantee
          </h2>
          <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
            Not satisfied? Get a full refund within 30 days, no questions asked.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              Start Free Trial
            </button>
            <button className="btn-secondary">
              Contact Sales
            </button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
