'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    proposalDate: '',
    budget: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        proposalDate: '',
        budget: ''
      });
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-12">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You for Reaching Out!
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              We've received your message and will get back to you within 24 hours. 
              We're excited to help you create the perfect proposal!
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Let's Create Your Perfect Proposal
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? Need personalized advice? We're here to help make your dream proposal a reality.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="text-pink-600 mr-4 text-xl">📧</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Us</h4>
                    <p className="text-gray-600">hello@perfectproposal.com</p>
                    <p className="text-sm text-gray-500">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-pink-600 mr-4 text-xl">💬</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Live Chat</h4>
                    <p className="text-gray-600">Available Mon-Fri, 9 AM - 6 PM EST</p>
                    <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                      Start Chat →
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-pink-600 mr-4 text-xl">📱</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Call Us</h4>
                    <p className="text-gray-600">1-800-PROPOSE</p>
                    <p className="text-sm text-gray-500">Free consultation available</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Quick Response Times</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Email: Within 24 hours
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Live Chat: Instant during business hours
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Phone: Immediate during business hours
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Question</option>
                    <option value="proposal-help">Proposal Help</option>
                    <option value="pricing">Pricing Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
              </div>

              {formData.subject === 'proposal-help' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="proposalDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Planned Proposal Date
                    </label>
                    <input
                      type="date"
                      id="proposalDate"
                      name="proposalDate"
                      value={formData.proposalDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Budget
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">Select budget range</option>
                      <option value="under-500">Under $500</option>
                      <option value="500-2000">$500 - $2,000</option>
                      <option value="2000-5000">$2,000 - $5,000</option>
                      <option value="5000-10000">$5,000 - $10,000</option>
                      <option value="over-10000">Over $10,000</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Tell us about your proposal plans or questions..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
