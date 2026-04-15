'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import LuxuryWeddingCard from '../ui/LuxuryWeddingCard';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah & Michael",
      location: "New York, NY",
      rating: 5,
      comment: "Perfect Proposal helped me create the most magical moment of my life. The AI suggestions were incredibly personal and thoughtful. She said yes!",
      date: "2 weeks ago",
      image: "👰‍♀️"
    },
    {
      id: 2,
      name: "Emily & James",
      location: "Los Angeles, CA",
      rating: 5,
      comment: "I was so nervous about proposing, but this tool gave me the confidence I needed. The personalized speech brought tears to her eyes!",
      date: "1 month ago",
      image: "💕"
    },
    {
      id: 3,
      name: "Jessica & David",
      location: "Chicago, IL",
      rating: 5,
      comment: "The proposal ideas were so creative and unique. It felt like it was written just for us. Highly recommend to anyone planning to propose!",
      date: "1 month ago",
      image: "💍"
    },
    {
      id: 4,
      name: "Amanda & Chris",
      location: "Miami, FL",
      rating: 5,
      comment: "From the location suggestions to the perfect words to say, every detail was perfect. This made our engagement story absolutely beautiful.",
      date: "2 months ago",
      image: "🌹"
    },
    {
      id: 5,
      name: "Rachel & Tom",
      location: "Seattle, WA",
      rating: 5,
      comment: "The AI understood our relationship so well! The proposal was intimate, romantic, and everything she dreamed of. Thank you!",
      date: "3 months ago",
      image: "✨"
    },
    {
      id: 6,
      name: "Lisa & Mark",
      location: "Boston, MA",
      rating: 5,
      comment: "Best investment I made for my proposal. The suggestions were spot-on and made the moment unforgettable. 5 stars!",
      date: "3 months ago",
      image: "💐"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-gold' : 'text-text-muted'}>
        ⭐
      </span>
    ));
  };

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              <span className="text-glow">Love Stories We've Helped Create</span>
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
              Join thousands of happy couples who started their forever with our intelligent wedding platform
            </p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <LuxuryWeddingCard
              key={testimonial.id}
              coupleNames={testimonial.name}
              subtitle={testimonial.location}
              description={`"${testimonial.comment}"`}
              icon={testimonial.image}
              date={testimonial.date}
              primaryAction={{
                text: "Read Full Story",
                href: "/testimonials"
              }}
              secondaryAction={{
                text: "Share Story",
                href: "/share"
              }}
              tags={["Happy Couple", "Success Story"]}
            />
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-text-primary mb-6">
              <span className="text-glow-secondary">Ready to Create Your Perfect Story?</span>
            </h3>
            <p className="text-lg text-text-muted mb-8 leading-relaxed">
              Join thousands of couples who have created unforgettable moments with our intelligent wedding platform
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/wedding-cards"
                className="btn-primary"
              >
                Start Your Story
              </Link>
              <Link
                href="/testimonials"
                className="btn-secondary"
              >
                Read More Stories
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
