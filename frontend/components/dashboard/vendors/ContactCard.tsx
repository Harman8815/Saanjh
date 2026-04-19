'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, ExternalLink, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Vendor, VendorStatus } from '../../../types/vendor';

interface ContactCardProps {
  vendor: Vendor;
  className?: string;
}

const statusConfig = {
  available: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Available' },
  unavailable: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Unavailable' },
  booked: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Booked' },
};

export default function ContactCard({ vendor, className = '' }: ContactCardProps) {
  const status = statusConfig[vendor.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 rounded-2xl ${className}`}
    >
      <h3 className="text-xl font-semibold text-text-primary mb-6">Contact Information</h3>
      
      {/* Status */}
      <div className="flex items-center gap-2 mb-6">
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
          <StatusIcon size={12} />
          {status.label}
        </span>
      </div>

      {/* Contact Details */}
      <div className="space-y-4">
        {/* Phone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Phone size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-text-muted">Phone</p>
            <a 
              href={`tel:${vendor.phone}`}
              className="text-text-primary hover:text-primary transition-colors"
            >
              {vendor.phone}
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Mail size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-text-muted">Email</p>
            <a 
              href={`mailto:${vendor.email}`}
              className="text-text-primary hover:text-primary transition-colors"
            >
              {vendor.email}
            </a>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-text-muted">Location</p>
            <p className="text-text-primary">{vendor.location}</p>
          </div>
        </div>

        {/* Website */}
        {vendor.website && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ExternalLink size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Website</p>
              <a 
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary hover:text-primary transition-colors"
              >
                Visit Website
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <a 
          href={`tel:${vendor.phone}`}
          className="flex-1 btn-secondary text-center py-3"
        >
          Call Now
        </a>
        <a 
          href={`mailto:${vendor.email}`}
          className="flex-1 btn-primary text-center py-3"
        >
          Send Email
        </a>
      </div>
    </motion.div>
  );
}
