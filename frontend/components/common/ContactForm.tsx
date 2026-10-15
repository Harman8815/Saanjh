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
      <section className="py-24 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12">
            <div className="text-6xl mb-6">💌</div>
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              <span className="text-glow">Thank You for Reaching Out!</span>
            </h2>
            <p className="text-xl text-text-muted mb-8 leading-relaxed">
              We&apos;ve received your message and will get back to you within 24 hours. 
              We&apos;re excited to help you create the perfect wedding!
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="btn-primary"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            <span className="text-glow">Let&apos;s Create Your Perfect Wedding</span>
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
            Have questions? Need personalized advice? We&apos;re here to help make your dream wedding a reality.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-6">Get in Touch</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="text-gold mr-4 text-xl">📧</div>
                  <div>
                    <h4 className="font-semibold text-text-primary">Email Us</h4>
                    <p className="text-text-secondary">hello@perfectwedding.com</p>
                    <p className="text-sm text-text-muted">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-bronze mr-4 text-xl">💬</div>
                  <div>
                    <h4 className="font-semibold text-text-primary">Live Chat</h4>
                    <p className="text-text-secondary">Available Mon-Fri, 9 AM - 6 PM EST</p>
                    <button className="text-gold hover:text-primary text-sm font-medium">
                      Start Chat →
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-champagne mr-4 text-xl">📱</div>
                  <div>
                    <h4 className="font-semibold text-text-primary">Call Us</h4>
                    <p className="text-text-secondary">1-800-WEDDING</p>
                    <p className="text-sm text-text-muted">Free consultation available</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h4 className="font-semibold text-text-primary mb-3">Quick Response Times</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-gold/20 mr-2" />
                  <span>Email: Within 24 hours</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-bronze/20 mr-2" />
                  <span>Live Chat: Instant during business hours</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-champagne/20 mr-2" />
                  <span>Phone: Immediate during business hours</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 glass-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 glass-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 glass-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Question</option>
                    <option value="proposal-help">Wedding Help</option>
                    <option value="pricing">Pricing Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
              </div>

              {formData.subject === 'proposal-help' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="proposalDate" className="block text-sm font-medium text-text-primary mb-2">
                      Planned Wedding Date
                    </label>
                    <input
                      type="date"
                      id="proposalDate"
                      name="proposalDate"
                      value={formData.proposalDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 glass-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-text-primary mb-2">
                      Estimated Budget
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 glass-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 glass-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell us about your wedding plans or questions..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
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
