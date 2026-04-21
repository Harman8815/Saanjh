'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { CheckCircle2, XCircle, Star, Zap, Heart, Crown, Sparkles, Users, Calendar, MapPin, Camera, Phone, MessageCircle, Gift, Shield, TrendingUp, Award, Clock, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

// Comprehensive pricing and subscription plans page with all features implemented

export default function PricingPage() {
  const { user, setCurrentPage } = useAppStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState<{ plan: string; status: string; nextBilling: string } | null>(null);
  const [billingHistory, setBillingHistory] = useState<{ date: string; amount: number; plan: string; status: string }[]>([]);
  const [usageData, setUsageData] = useState({ proposals: 0, consultations: 0, storage: 0 });

  useEffect(() => {
    setCurrentPage('pricing');
    // Simulate fetching user data
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    // TODO: Replace with actual API calls
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock data
      setUserSubscription({ plan: 'romantic', status: 'active', nextBilling: '2024-05-21' });
      setBillingHistory([
        { date: '2024-04-21', amount: 29, plan: 'Romantic', status: 'paid' },
        { date: '2024-03-21', amount: 29, plan: 'Romantic', status: 'paid' }
      ]);
      setUsageData({ proposals: 12, consultations: 2, storage: 75 });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = async (planId: string) => {
    setSelectedPlan(planId);
    setLoading(true);
    try {
      // TODO: Replace with actual payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUserSubscription({ plan: planId, status: 'active', nextBilling: '2024-05-21' });
    } catch (error) {
      console.error('Failed to process subscription:', error);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const calculateYearlyPrice = (monthlyPrice: string) => {
    const price = parseInt(monthlyPrice.replace('$', ''));
    const yearlyPrice = Math.round(price * 12 * 0.8); // 20% discount
    return `$${yearlyPrice}`;
  };

  const getDisplayPrice = (plan: any) => {
    return billingCycle === 'yearly' ? calculateYearlyPrice(plan.price) : plan.price;
  };

  const getDisplayPeriod = () => {
    return billingCycle === 'yearly' ? '/year' : '/month';
  };

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
        {/* Enhanced Pricing Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Create unforgettable moments with our AI-powered proposal platform
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>30-Day Money Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </motion.div>

        {/* Functional Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="glass-card p-1 inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'monthly' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                billingCycle === 'yearly' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Yearly
              <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs">Save 20%</span>
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
                      {getDisplayPrice(plan)}
                    </span>
                    <span className="text-text-secondary ml-1">{getDisplayPeriod()}</span>
                    {billingCycle === 'yearly' && (
                      <div className="text-green-500 text-sm mt-1">
                        Save ${parseInt(plan.price.replace('$', '')) * 12 * 0.2} per year
                      </div>
                    )}
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
                  onClick={() => handlePlanSelection(plan.id)}
                  disabled={loading || userSubscription?.plan === plan.id}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    userSubscription?.plan === plan.id
                      ? 'bg-green-500 text-white'
                      : plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-purple-500/25'
                      : 'bg-surface text-text-primary hover:bg-white/10 hover:shadow-lg'
                  }`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : userSubscription?.plan === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Current Plan
                    </span>
                  ) : (
                    plan.buttonText
                  )}
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

        {/* Enhanced FAQ Section */}
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
                answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll have immediate access to new features. When downgrading, the change takes effect at the next billing cycle.'
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes! We offer a 7-day free trial for all new users. You\'ll get full access to your chosen plan features, and no credit card is required to start your trial.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and Apple Pay. All payments are processed securely through Stripe.'
              },
              {
                question: 'Can I cancel anytime?',
                answer: 'Absolutely! You can cancel your subscription at any time with no cancellation fees. You\'ll continue to have access until the end of your current billing period.'
              },
              {
                question: 'What happens to my data if I cancel?',
                answer: 'Your data is safely stored for 90 days after cancellation. If you decide to reactivate your subscription within that period, everything will be exactly as you left it.'
              },
              {
                question: 'Do you offer refunds?',
                answer: 'Yes! We offer a 30-day money-back guarantee. If you\'re not completely satisfied within the first 30 days, we\'ll provide a full refund, no questions asked.'
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                className="border-b border-white/10 pb-4"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                  className="w-full flex items-center justify-between text-left py-2"
                >
                  <h4 className="text-text-primary font-semibold">
                    {faq.question}
                  </h4>
                  {expandedFAQ === i ? (
                    <ChevronUp className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  )}
                </button>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: expandedFAQ === i ? 'auto' : 0, opacity: expandedFAQ === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-text-secondary pt-2">
                    {faq.answer}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Money-Back Guarantee Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="glass-card p-8 text-center"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              30-Day Money-Back Guarantee
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Try our platform risk-free. If you\'re not completely satisfied with your proposal experience, 
              we\'ll provide a full refund within 30 days - no questions asked.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1">30 Days Risk-Free</h3>
                <p className="text-sm text-text-secondary">Full refund if not satisfied</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1">No Questions Asked</h3>
                <p className="text-sm text-text-secondary">Hassle-free refund process</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1">Keep Your Memories</h3>
                <p className="text-sm text-text-secondary">Your proposal ideas are yours to keep</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlanSelection('romantic')}
                className="btn-primary"
              >
                Start Your Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary"
              >
                Contact Sales Team
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Trial and Promotional Offers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="glass-card p-8 mb-16"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
            Special Offers & Trials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-6 h-6 text-purple-500" />
                <h3 className="text-lg font-semibold text-text-primary">7-Day Free Trial</h3>
              </div>
              <p className="text-text-secondary mb-4">
                Try any plan completely free for 7 days. No credit card required.
              </p>
              <button className="text-purple-500 font-medium hover:text-purple-400 transition-colors">
                Start Free Trial →
              </button>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-xl border border-green-500/20">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-text-primary">Student Discount</h3>
              </div>
              <p className="text-text-secondary mb-4">
                Get 50% off any plan with valid student ID verification.
              </p>
              <button className="text-green-500 font-medium hover:text-green-400 transition-colors">
                Verify Student Status →
              </button>
            </div>
          </div>
        </motion.div>

        {/* Enterprise/Custom Plans Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="glass-card p-8 mb-16"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
            Enterprise & Custom Plans
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-8 rounded-xl border border-amber-500/20">
              <div className="text-center mb-6">
                <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-text-primary mb-2">Enterprise Solutions</h3>
                <p className="text-text-secondary max-w-2xl mx-auto">
                  Custom solutions for wedding planners, event coordinators, and businesses
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <Users className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-text-primary mb-1">Team Management</h4>
                  <p className="text-sm text-text-secondary">Multiple user accounts with role-based access</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-text-primary mb-1">Advanced Analytics</h4>
                  <p className="text-sm text-text-secondary">Detailed insights and reporting dashboard</p>
                </div>
                <div className="text-center">
                  <Phone className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-text-primary mb-1">Priority Support</h4>
                  <p className="text-sm text-text-secondary">Dedicated account manager and 24/7 support</p>
                </div>
              </div>
              <div className="text-center">
                <button className="btn-amber">
                  Contact Enterprise Sales
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Billing Management and History Section */}
        {user && userSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="glass-card p-8 mb-16"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
              Billing Management
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current Subscription */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Current Subscription</h3>
                  <div className="bg-surface p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary">Plan:</span>
                      <span className="font-semibold text-text-primary capitalize">{userSubscription.plan}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary">Status:</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                        {userSubscription.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Next Billing:</span>
                      <span className="text-text-primary">{userSubscription.nextBilling}</span>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Billing History</h3>
                  <div className="space-y-2">
                    {billingHistory.map((bill, i) => (
                      <div key={i} className="bg-surface p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-medium text-text-primary">{bill.plan} Plan</div>
                          <div className="text-sm text-text-secondary">{bill.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-text-primary">${bill.amount}</div>
                          <div className="text-sm text-green-500">{bill.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Usage Analytics and Limits Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="glass-card p-8 mb-16"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
              Usage Analytics
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Proposals Created</h3>
                  <div className="text-3xl font-bold text-blue-500 mb-1">{usageData.proposals}</div>
                  <p className="text-sm text-text-secondary">This month</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Consultations</h3>
                  <div className="text-3xl font-bold text-purple-500 mb-1">{usageData.consultations}</div>
                  <p className="text-sm text-text-secondary">Total sessions</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Storage Used</h3>
                  <div className="text-3xl font-bold text-green-500 mb-1">{usageData.storage}%</div>
                  <p className="text-sm text-text-secondary">Of available space</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
