'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Mail, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { VendorCatalog } from '../../../types/api';
import { useFormatCurrency } from '../../../hooks/useFormatCurrency';

interface VendorCardProps {
  vendor: VendorCatalog;
  index: number;
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  photographer: { label: 'Photographer', color: 'rose' },
  catering: { label: 'Catering', color: 'amber' },
  decoration: { label: 'Decoration', color: 'violet' },
  others: { label: 'Others', color: 'blue' },
};

const statusConfig = {
  available: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Available' },
  unavailable: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Unavailable' },
  booked: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Booked' },
};

export default function VendorCard({ vendor, index }: VendorCardProps) {
  const categoryName = vendor.category?.name?.toLowerCase() || 'others';
  const category = categoryName.includes('photo') ? 'photographer' :
                   categoryName.includes('cater') ? 'catering' :
                   categoryName.includes('decor') ? 'decoration' : 'others';
  const config = categoryConfig[category] || categoryConfig.others;
  const status = statusConfig.available; // API doesn't provide status, default to available
  const StatusIcon = status.icon;
  const { formatCurrency } = useFormatCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group glass-card rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image Header */}
      <div className="relative h-48 bg-surface overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-4xl">{vendor.name.charAt(0)}</span>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/30`}>
            {config.label}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
            <StatusIcon size={12} />
            {status.label}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 right-4">
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-surface/90 backdrop-blur-sm border border-white/20">
            {vendor.price_range ? `$${vendor.price_range}` : 'Price on request'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Name & Rating */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
              {vendor.name}
            </h3>
            <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
              <MapPin size={12} />
              Contact: {vendor.contact}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-gold/10 px-2 py-1 rounded-lg">
            <Star size={14} className="text-gold fill-current" />
            <span className="text-sm font-medium text-gold">{vendor.rating}</span>
          </div>
        </div>

        {/* Starting Price */}
        <div className="flex items-center justify-between py-2 border-t border-b border-white/5">
          <span className="text-sm text-text-muted">Price Range</span>
          <span className="text-lg font-semibold text-primary">
            {vendor.price_range ? formatCurrency(vendor.price_range) : 'Contact for pricing'}
          </span>
        </div>

        {/* Contact Button */}
        <a
          href={`tel:${vendor.contact}`}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Phone size={16} />
          Contact Vendor
        </a>
      </div>
    </motion.div>
  );
}
