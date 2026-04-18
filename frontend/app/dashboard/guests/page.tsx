'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';
import { motion } from 'framer-motion';
import { Users, Check, Clock, X, List, MapPin, Utensils, UserPlus } from 'lucide-react';
import Link from 'next/link';
import GuestLayoutSkeleton from '../../../components/dashboard/GuestLayoutSkeleton';

export default function GuestManagementDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    declined: 0
  });

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        total: 150,
        confirmed: 89,
        pending: 45,
        declined: 16
      });
      setIsLoading(false);
    }, 1500); // Simulate 1.5 second loading time

    return () => clearTimeout(timer);
  }, []);

  const dashboardCards = [
    {
      id: 'guest-list',
      title: 'Guest List',
      description: 'View and manage all guest information',
      icon: <List size={32} />,
      color: 'primary',
      count: stats.total,
      href: '/dashboard/guests/list'
    },
    {
      id: 'rsvp-status',
      title: 'RSVP Status',
      description: 'Track guest responses and attendance',
      icon: <Check size={32} />,
      color: 'green',
      count: stats.confirmed,
      href: '/dashboard/guests/rsvp'
    },
    {
      id: 'seating-chart',
      title: 'Seating Chart',
      description: 'Organize guest seating arrangements',
      icon: <MapPin size={32} />,
      color: 'secondary',
      count: stats.confirmed,
      href: '/dashboard/guests/seating'
    },
    {
      id: 'meal-preferences',
      title: 'Meal Preferences',
      description: 'Manage dietary requirements and choices',
      icon: <Utensils size={32} />,
      color: 'accent',
      count: 23,
      href: '/dashboard/guests/meals'
    }
  ];

  return (
    <>
      {isLoading ? (
        <GuestLayoutSkeleton />
      ) : (
        <div className=" bg-background flex items-center justify-center">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="heading-emotional text-emotional-4xl text-text-primary mb-4">
            <span className="text-glow">Guest Management</span>
          </h1>
          <p className="body-emotional text-emotional-xl text-text-muted max-w-3xl mx-auto">
            Manage your wedding guests and track RSVP responses
          </p>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <Link key={card.id} href={card.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="glass-card p-6 cursor-pointer hover:scale-105 transition-all duration-300 group"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-emotional-3xl text-primary group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  {card.count !== undefined && (
                    <span className="text-data-2xl font-bold text-primary bg-primary/20 px-3 py-1 rounded-full">
                      {card.count}
                    </span>
                  )}
                </div>
                <h3 className="heading-data text-data-lg text-text-primary mb-2 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="body-data text-data-sm text-text-muted">
                  {card.description}
                </p>
                <div className="mt-4 flex items-center text-text-muted">
                  <span className="text-xs">Click to manage →</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="heading-data text-data-2xl text-text-primary mb-6">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Invited', value: stats.total, icon: <UserPlus size={20} />, color: 'primary' },
              { label: 'Confirmed', value: stats.confirmed, icon: <Check size={20} />, color: 'green' },
              { label: 'Pending', value: stats.pending, icon: <Clock size={20} />, color: 'yellow' },
              { label: 'Declined', value: stats.declined, icon: <X size={20} />, color: 'red' }
            ].map((stat, index) => (
              <div key={stat.label} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                <div className="text-primary">{stat.icon}</div>
                <div>
                  <div className={`text-data-lg font-bold text-${stat.color}`}>{stat.value}</div>
                  <div className="label-ui text-ui-xs text-text-muted">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
        </div>
      )}
    </>
  );
}
