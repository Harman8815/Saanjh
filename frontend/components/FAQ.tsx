'use client';

import { useState } from 'react';

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
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about creating the perfect proposal
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-pink-300 transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-inset"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-6 h-6 text-gray-500 transform transition-transform ${
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
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-lg text-gray-700 mb-6">
            Our support team is here to help you create the perfect proposal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors">
              Contact Support
            </button>
            <button className="bg-white text-pink-600 border-2 border-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition-colors">
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
