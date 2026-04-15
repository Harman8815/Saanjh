'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  return (
    <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Romantic Proposal Tips & Ideas
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join our newsletter for exclusive proposal ideas, relationship advice, and special offers delivered to your inbox.
          </p>
        </div>

        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-6 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-pink-300"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        ) : (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">Welcome to the Family!</h3>
            <p className="opacity-90">
              Thank you for subscribing! Check your email for a welcome message and exclusive tips.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm opacity-75">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Weekly proposal ideas</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Relationship tips</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Exclusive offers</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>No spam, unsubscribe anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
