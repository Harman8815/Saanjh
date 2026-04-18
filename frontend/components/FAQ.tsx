'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does the AI proposal generator work?",
      answer: "Our AI analyzes information about your relationship, partner's preferences, and your style to create personalized proposal ideas. It takes into account factors like shared interests, meaningful locations, and romantic gestures to suggest the perfect proposal plan."
    },
    {
      question: "Is my personal information secure?",
      answer: "Absolutely! We use industry-standard encryption and security measures to protect your data. Your personal information and relationship details are kept confidential and are never shared with third parties."
    },
    {
      question: "How long does it take to generate a proposal?",
      answer: "The AI typically generates personalized proposal ideas within 2-3 minutes. You can then review, customize, and refine the suggestions until they're perfect for your special moment."
    },
    {
      question: "Can I customize the generated proposals?",
      answer: "Yes! The AI provides a starting point, but you have full control to modify, add, or change any element of the proposal. Our goal is to inspire you, not replace your personal touch."
    },
    {
      question: "What if I'm not satisfied with the suggestions?",
      answer: "We offer a 100% satisfaction guarantee. If you're not happy with the generated ideas, you can regenerate them with different parameters or request a full refund within 30 days."
    },
    {
      question: "Do you offer proposals for different budgets?",
      answer: "Absolutely! Our AI can generate proposals for any budget - from intimate at-home proposals to elaborate destination proposals. Simply specify your budget range, and we'll tailor the suggestions accordingly."
    },
    {
      question: "Can I get help with the proposal speech?",
      answer: "Yes! Our AI helps craft heartfelt, personalized proposal speeches based on your relationship story. You can edit and refine the words until they perfectly express your feelings."
    },
    {
      question: "Do you provide vendor recommendations?",
      answer: "We can suggest trusted vendors like photographers, florists, and venues in your area based on your proposal style and budget. These are curated recommendations from our network of professionals."
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            <span className="text-glow">Frequently Asked Questions</span>
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about creating the perfect Wedding Experience
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass-card overflow-hidden hover:border-primary/20 transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
              >
                <h3 className="text-lg font-semibold text-text-primary pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-6 h-6 text-text-muted transform transition-transform ${
                      activeIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              
              {activeIndex === index && (
                <div className="px-6 pb-4">
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-text-secondary leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-text-primary mb-6">
              <span className="text-glow-secondary">Still Have Questions?</span>
            </h3>
            <p className="text-lg text-text-muted mb-8 leading-relaxed">
              Our support team is here to help you create the Perfect Wedding Experience
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/contact"
                className="btn-primary"
              >
                Contact Support
              </Link>
              <Link
                href="/contact"
                className="btn-secondary"
              >
                Live Chat
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
