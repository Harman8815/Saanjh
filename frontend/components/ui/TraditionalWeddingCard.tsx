'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface TraditionalWeddingCardProps {
  title: string;
  description: string;
  icon: string;
  features: string[];
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  primaryAction?: {
    text: string;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
}

export default function TraditionalWeddingCard({
  title,
  description,
  icon,
  features,
  isSelected = false,
  onClick,
  className = '',
  primaryAction,
  secondaryAction
}: TraditionalWeddingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`traditional-wedding-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: isSelected ? 1.05 : 1.02,
        y: isSelected ? -15 : -5
      }}
      animate={{
        y: isSelected ? -10 : 0,
        scale: isSelected ? 1.03 : 1
      }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Card Container with Stacked Effect */}
      <div className="traditional-card-stack">
        {/* Back Cards */}
        <div className="traditional-card-back traditional-card-back-1" />
        <div className="traditional-card-back traditional-card-back-2" />
        
        {/* Main Card */}
        <div className={`traditional-card-main ${isSelected ? 'selected' : ''}`}>
          {/* Icon Section */}
          <div className="traditional-icon-section">
            <div className="traditional-icon-wrapper">
              <span className="traditional-icon">{icon}</span>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="traditional-content">
            <h3 className="traditional-title">{title}</h3>
            <p className="traditional-description">{description}</p>
            
            {/* Features List */}
            <div className="traditional-features">
              {features.map((feature, index) => (
                <div key={index} className="traditional-feature-item">
                  <div className="traditional-feature-bullet" />
                  <span className="traditional-feature-text">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          {(primaryAction || secondaryAction) && (
            <div className="traditional-actions">
              {primaryAction && (
                <motion.button
                  className="traditional-action traditional-action-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    primaryAction.onClick();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {primaryAction.text}
                </motion.button>
              )}
              {secondaryAction && (
                <motion.button
                  className="traditional-action traditional-action-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    secondaryAction.onClick();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {secondaryAction.text}
                </motion.button>
              )}
            </div>
          )}
          
          {/* Selection Indicator */}
          {isSelected && (
            <div className="traditional-selection-indicator">
              <span className="selection-text">SELECTED</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
