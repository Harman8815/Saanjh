'use client';

import { motion } from 'framer-motion';
import { Star, ThumbsUp, Calendar } from 'lucide-react';
import { VendorReview } from '../../../types/vendor';

interface ReviewsProps {
  reviews: VendorReview[];
  className?: string;
}

export default function Reviews({ reviews, className = '' }: ReviewsProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'text-gold fill-current' : 'text-text-muted'}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 rounded-2xl ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-primary">Reviews</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length))}
          </div>
          <span className="text-text-primary font-medium">
            {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
          </span>
          <span className="text-text-muted">({reviews.length})</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-muted">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-white/5 pb-6 last:border-0 last:pb-0"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <span className="text-white font-medium">
                      {review.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">{review.userName}</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-text-muted flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(review.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Title */}
              <h5 className="font-medium text-text-primary mb-2">{review.title}</h5>

              {/* Review Content */}
              <p className="text-text-secondary mb-3">{review.content}</p>

              {/* Review Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.photos.map((photo, photoIndex) => (
                    <img
                      key={photoIndex}
                      src={photo}
                      alt={`Review photo ${photoIndex + 1}`}
                      className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <button className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors">
                <ThumbsUp size={14} />
                <span>Helpful ({review.helpful})</span>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
