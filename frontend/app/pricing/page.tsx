'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { CheckCircle2, XCircle, Star, Zap, Heart, Crown, Sparkles, Users, Calendar, MapPin, Camera, Phone, MessageCircle, Gift } from 'lucide-react';
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
      description: 'Perfect for couples beginning their proposal journey',
      icon: Heart,
      color: 'from-blue-500 to-cyan-500',
      features: [
        { text: 'AI-powered proposal ideas', icon: Sparkles, included: true },
        { text: '3 unique proposal concepts', icon: Gift, included: true },
        { text: 'Basic speech generator', icon: MessageCircle, included: true },
        { text: 'Email support (48h response)', icon: MessageCircle, included: true },
        { text: '7-day access', icon: Calendar, included: true },
        { text: 'Vendor recommendations', icon: Users, included: false },
        { text: 'Custom location scouting', icon: MapPin, included: false },
        { text: 'Priority support', icon: Zap, included: false }
      ],
      popular: false,
      buttonText: 'Start Your Journey'
    },
    {
      id: 'romantic',
      name: 'Romantic',
      price: '$29',
      period: '/month',
      description: 'Our most popular choice for unforgettable proposals',
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      features: [
        { text: 'Advanced AI proposal ideas', icon: Sparkles, included: true },
        { text: 'Unlimited proposal concepts', icon: Gift, included: true },
        { text: 'Personalized speech generator', icon: MessageCircle, included: true },
        { text: 'Vendor recommendations', icon: Users, included: true },
        { text: 'Location suggestions', icon: MapPin, included: true },
        { text: 'Priority email support (24h)', icon: Zap, included: true },
        { text: '30-day access', icon: Calendar, included: true },
        { text: '1-on-1 consultation', icon: Phone, included: false },
        { text: 'Photography coordination', icon: Camera, included: false }
      ],
      popular: true,
      buttonText: 'Choose Romantic'
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: '$79',
      period: '/month',
      description: 'The complete premium experience for your dream proposal',
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      features: [
        { text: 'Premium AI proposal ideas', icon: Sparkles, included: true },
        { text: 'Unlimited everything', icon: Zap, included: true },
        { text: '1-on-1 consultation', icon: Phone, included: true },
        { text: 'Photography coordination', icon: Camera, included: true },
        { text: 'Vendor management', icon: Users, included: true },
        { text: 'Custom location scouting', icon: MapPin, included: true },
        { text: '24/7 phone & video support', icon: MessageCircle, included: true },
        { text: 'Lifetime access', icon: Calendar, included: true },
        { text: 'Proposal day assistance', icon: Heart, included: true }
      ],
      popular: false,
      buttonText: 'Go Ultimate'
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              className={`relative group ${plan.popular ? 'scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2"
                  >
                    <Star className="w-4 h-4 fill-current" />
                    Most Popular
                  </motion.div>
                </div>
              )}

              <div className={`glass-card p-8 h-full transition-all duration-300 hover:shadow-2xl hover:shadow-primary/25 ${
                plan.popular ? 'ring-2 ring-primary bg-gradient-to-br from-purple-500/5 to-pink-500/5' : ''
              }`}>
                {/* Plan Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}
                >
                  <plan.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Plan Name and Price */}
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-text-primary mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className={`text-5xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                      {plan.price}
                    </span>
                    <span className="text-text-secondary ml-1">{plan.period}</span>
                  </div>
                  <p className="text-text-secondary leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-text-primary mb-6">
                    What&apos;s included:
                  </h4>
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.1 + i * 0.05 }}
                        className={`flex items-start gap-3 ${feature.included ? '' : 'opacity-50'}`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          feature.included ? 'bg-green-500/20' : 'bg-gray-500/20'
                        }`}>
                          {feature.included ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-gray-500" />
                          )}
                        </div>
                        <div className="flex items-start gap-2">
                          <feature.icon className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" />
                          <span className="text-text-secondary text-sm">{feature.text}</span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-purple-500/25'
                      : 'bg-surface text-text-primary hover:bg-white/10 hover:shadow-lg'
                  }`}
                >
                  {plan.buttonText}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
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
                  <th className="text-center p-4 text-text-primary">
                    <div className="flex items-center justify-center gap-2">
                      <Heart className="w-4 h-4 text-blue-500" />
                      Starter
                    </div>
                  </th>
                  <th className="text-center p-4 text-text-primary">
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-4 h-4 text-purple-500" />
                      Romantic
                    </div>
                  </th>
                  <th className="text-center p-4 text-text-primary">
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      Ultimate
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'AI Proposal Ideas', starter: true, romantic: true, ultimate: true, icon: Sparkles },
                  { name: 'Speech Generator', starter: true, romantic: true, ultimate: true, icon: MessageCircle },
                  { name: 'Vendor Recommendations', starter: false, romantic: true, ultimate: true, icon: Users },
                  { name: 'Priority Support', starter: false, romantic: true, ultimate: true, icon: Zap },
                  { name: '1-on-1 Consultation', starter: false, romantic: false, ultimate: true, icon: Phone },
                  { name: 'Photography Coordination', starter: false, romantic: false, ultimate: true, icon: Camera },
                  { name: 'Unlimited Access', starter: false, romantic: false, ultimate: true, icon: Calendar },
                  { name: 'Proposal Day Assistance', starter: false, romantic: false, ultimate: true, icon: Heart }
                ].map((feature, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <feature.icon className="w-4 h-4 text-text-secondary" />
                        <span className="text-text-secondary">{feature.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {feature.starter ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-500 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {feature.romantic ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-500 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {feature.ultimate ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-500 mx-auto" />
                      )}
                    </td>
                  </motion.tr>
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
