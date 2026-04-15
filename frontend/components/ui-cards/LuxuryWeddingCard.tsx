'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface LuxuryWeddingCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  image?: string;
  date?: string;
  venue?: string;
  coupleNames?: string;
  primaryAction?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  tags?: string[];
  className?: string;
  children?: React.ReactNode;
}

export default function LuxuryWeddingCard({
  title,
  subtitle,
  description,
  icon,
  image,
  date,
  venue,
  coupleNames,
  primaryAction,
  secondaryAction,
  tags = [],
  className = '',
  children
}: LuxuryWeddingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      className={`luxury-wedding-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
    >
      {/* Frosted Luxury Foundation */}
      <div className="luxury-card-base">
        {/* Gradient Glass Effect Overlay */}
        <div className="luxury-gradient-overlay" />
        
        {/* Noise Texture Overlay */}
        <div className="luxury-noise-texture" />
        
        {/* Main Content */}
        <div className="luxury-card-content">
          {/* Header Section */}
          <div className="luxury-card-header">
            {icon && (
              <div className="luxury-icon-wrapper">
                <span className="luxury-icon">{icon}</span>
              </div>
            )}
            
            {image && (
              <div className="luxury-image-wrapper">
                <img src={image} alt={title} className="luxury-image" />
              </div>
            )}
            
            {coupleNames && (
              <div className="luxury-couple-names">
                <h3 className="luxury-couple-title">{coupleNames}</h3>
              </div>
            )}
            
            {title && (
              <div className="luxury-title-wrapper">
                <h3 className="luxury-title">{title}</h3>
                {subtitle && <p className="luxury-subtitle">{subtitle}</p>}
              </div>
            )}
          </div>
          
          {/* Body Section */}
          <div className="luxury-card-body">
            {description && (
              <p className="luxury-description">{description}</p>
            )}
            
            {/* Event Details */}
            {(date || venue) && (
              <div className="luxury-event-details">
                {date && (
                  <div className="luxury-detail-item">
                    <div className="luxury-detail-icon"> calendar_today</div>
                    <span className="luxury-detail-text">{date}</span>
                  </div>
                )}
                {venue && (
                  <div className="luxury-detail-item">
                    <div className="luxury-detail-icon"> location_on</div>
                    <span className="luxury-detail-text">{venue}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Tags */}
            {tags.length > 0 && (
              <div className="luxury-tags">
                {tags.map((tag, index) => (
                  <span key={index} className="luxury-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Custom Content */}
            {children}
          </div>
          
          {/* Footer Section */}
          <div className="luxury-card-footer">
            {/* Primary Action */}
            {primaryAction && (
              <motion.div
                className="luxury-action-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {primaryAction.href ? (
                  <Link
                    href={primaryAction.href}
                    onClick={primaryAction.onClick}
                    className="luxury-action-button luxury-action-primary-button"
                  >
                    {primaryAction.text}
                  </Link>
                ) : (
                  <button
                    onClick={primaryAction.onClick}
                    className="luxury-action-button luxury-action-primary-button"
                  >
                    {primaryAction.text}
                  </button>
                )}
              </motion.div>
            )}
            
            {/* Secondary Action */}
            {secondaryAction && (
              <motion.div
                className="luxury-action-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {secondaryAction.href ? (
                  <Link
                    href={secondaryAction.href}
                    onClick={secondaryAction.onClick}
                    className="luxury-action-button luxury-action-secondary-button"
                  >
                    {secondaryAction.text}
                  </Link>
                ) : (
                  <button
                    onClick={secondaryAction.onClick}
                    className="luxury-action-button luxury-action-secondary-button"
                  >
                    {secondaryAction.text}
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Ambient Gradient Animation */}
      <div className="luxury-ambient-gradient" />
    </motion.div>
  );
}
