'use client';

import { motion } from 'framer-motion';
import { X, MapPin, Users, DollarSign, Star, Check } from 'lucide-react';
import { VenueCatalog } from '../../types/api';

interface VenueComparisonModalProps {
  venues: VenueCatalog[];
  onClose: () => void;
  onRemove: (venueId: number) => void;
}

const formatPrice = (value: number) => `$${Number(value).toLocaleString()}`;

const capacityRange = (venue: VenueCatalog) => {
  if (!venue.capacity_max || venue.capacity_max === venue.capacity_min) {
    return `${venue.capacity_min} guests`;
  }
  return `${venue.capacity_min} - ${venue.capacity_max} guests`;
};

const amenityNames = (venue: VenueCatalog) =>
  (venue.amenities ?? []).map(amenity => amenity.name);

export default function VenueComparisonModal({
  venues,
  onClose,
  onRemove,
}: VenueComparisonModalProps) {
  const compared = venues.slice(0, 4);

  // Rows are attribute labels; each cell reads that attribute off the venue.
  const rows: Array<{ label: string; render: (venue: VenueCatalog) => React.ReactNode }> = [
    {
      label: 'Type',
      render: venue => (
        <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs capitalize">
          {venue.type}
        </span>
      ),
    },
    {
      label: 'Location',
      render: venue => (
        <span className="flex items-start gap-1 text-sm text-text-secondary">
          <MapPin size={14} className="mt-0.5 shrink-0" />
          {venue.address}
        </span>
      ),
    },
    {
      label: 'Capacity',
      render: venue => (
        <span className="flex items-center gap-1 text-sm text-text-primary">
          <Users size={14} className="text-text-muted" />
          {capacityRange(venue)}
        </span>
      ),
    },
    {
      label: 'Price',
      render: venue => (
        <span className="flex items-center gap-1 text-sm text-primary font-semibold">
          <DollarSign size={14} />
          {formatPrice(venue.price)}
        </span>
      ),
    },
    {
      label: 'Rating',
      render: venue => (
        <span className="flex items-center gap-1 text-sm text-text-primary">
          <Star size={14} className="text-yellow-400" />
          {venue.rating ? venue.rating.toFixed(1) : 'Not rated'}
        </span>
      ),
    },
    {
      label: 'Amenities',
      render: venue => {
        const names = amenityNames(venue);
        return names.length ? (
          <div className="flex flex-wrap gap-1">
            {names.map((name, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-surface border border-white/20 rounded-full text-xs text-text-muted"
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-text-muted">None listed</span>
        );
      },
    },
  ];

  // Cheapest venue per attribute, used to highlight the winning cell.
  const cheapest = compared.reduce(
    (best, venue) => (Number(venue.price) < Number(best.price) ? venue : best),
    compared[0]
  );
  const largest = compared.reduce(
    (best, venue) => (venue.capacity_max > best.capacity_max ? venue : best),
    compared[0]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-surface rounded-2xl border border-white/10 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={event => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Compare Venues</h2>
            <p className="text-text-muted text-sm mt-1">
              Side-by-side comparison of {compared.length} venue{compared.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
            aria-label="Close comparison"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comparison table */}
        <div className="overflow-auto flex-1 p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 text-text-muted text-sm font-medium w-32" />
                {compared.map(venue => (
                  <th key={venue.id} className="p-3 text-left align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">{venue.name}</h3>
                        <p className="text-text-muted text-xs capitalize">{venue.type}</p>
                      </div>
                      <button
                        onClick={() => onRemove(venue.id)}
                        className="p-1 rounded text-text-muted hover:text-red-500 transition-colors"
                        aria-label={`Remove ${venue.name} from comparison`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label} className="border-t border-white/10">
                  <td className="p-3 text-text-muted text-sm font-medium align-top">{row.label}</td>
                  {compared.map(venue => {
                    const isBest =
                      (row.label === 'Price' && venue.id === cheapest.id && compared.length > 1) ||
                      (row.label === 'Capacity' && venue.id === largest.id && compared.length > 1);

                    return (
                      <td key={venue.id} className="p-3 align-top">
                        <div className="flex items-start gap-2">
                          {row.render(venue)}
                          {isBest && (
                            <span className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 bg-green-500/20 text-green-500 rounded text-xs">
                              <Check size={10} />
                              Best
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
