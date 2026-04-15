import Link from 'next/link';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import FAQ from '../components/FAQ';
import Pricing from '../components/Pricing';
import ContactForm from '../components/ContactForm';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-pink-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Create the Perfect
              <span className="block text-pink-600">Wedding Proposal</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Let AI help you craft the most romantic and personalized proposal that will sweep your partner off their feet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/generator"
                className="bg-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-pink-700 transition-colors shadow-lg"
              >
                Start Creating 💕
              </Link>
              <Link
                href="/gallery"
                className="bg-white text-pink-600 border-2 border-pink-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-pink-50 transition-colors"
              >
                View Gallery
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-20">💐</div>
        <div className="absolute top-40 right-20 text-4xl opacity-20">💍</div>
        <div className="absolute bottom-20 left-1/4 text-5xl opacity-20">🌹</div>
        <div className="absolute bottom-40 right-10 text-6xl opacity-20">💕</div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Perfect Proposal?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge AI with romantic expertise to create unforgettable moments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Smart algorithms that understand your relationship and create personalized proposals.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">Unique Ideas</h3>
              <p className="text-gray-600">
                Get creative and romantic proposal ideas tailored to your partner's preferences.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Perfect Wording</h3>
              <p className="text-gray-600">
                Heartfelt speeches and messages that express your love beautifully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Pricing Section */}
      <Pricing />

      {/* FAQ Section */}
      <FAQ />

      {/* Newsletter Section */}
      <Newsletter />

      {/* Contact Form Section */}
      <ContactForm />

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Your Perfect Moment?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of couples who have created magical proposals with our help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/generator"
              className="bg-white text-pink-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Get Started Now
            </Link>
            <Link
              href="#contact"
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-pink-600 transition-colors"
            >
              Talk to Expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
