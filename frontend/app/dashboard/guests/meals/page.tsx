'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Users, ArrowLeft, Search, Download, Filter, Leaf, Wheat, Beef, Fish, AlertCircle, Info, Check, PieChart } from 'lucide-react';
import Link from 'next/link';
import GuestLayoutSkeleton from '../../../../components/dashboard/GuestLayoutSkeleton';
import { Guest } from '../../../../types/guest';

interface MealPreference {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export default function MealPreferencesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPreference, setFilterPreference] = useState<string>('all');

  const [guests, setGuests] = useState<Guest[]>([
    {
      id: 1,
      name: 'Emily Johnson',
      email: 'emily@email.com',
      phone: '+1-555-0123',
      side: 'Bride',
      plusOne: true,
      rsvpStatus: 'confirmed',
      mealPreference: 'vegetarian',
    },
    {
      id: 2,
      name: 'Michael Smith',
      email: 'michael@email.com',
      phone: '+1-555-0456',
      side: 'Groom',
      plusOne: false,
      rsvpStatus: 'confirmed',
      mealPreference: 'none',
    },
    {
      id: 3,
      name: 'Jessica Davis',
      email: 'jessica@email.com',
      phone: '+1-555-0789',
      side: 'Bride',
      plusOne: false,
      rsvpStatus: 'confirmed',
      mealPreference: 'gluten-free',
    },
    {
      id: 4,
      name: 'Robert Wilson',
      email: 'robert@email.com',
      phone: '+1-555-0321',
      side: 'Groom',
      plusOne: false,
      rsvpStatus: 'confirmed',
      mealPreference: 'vegan',
    },
    {
      id: 5,
      name: 'Sarah Brown',
      email: 'sarah@email.com',
      phone: '+1-555-0654',
      side: 'Bride',
      plusOne: true,
      rsvpStatus: 'confirmed',
      mealPreference: 'none',
    },
    {
      id: 6,
      name: 'David Lee',
      email: 'david@email.com',
      phone: '+1-555-0987',
      side: 'Groom',
      plusOne: false,
      rsvpStatus: 'confirmed',
      mealPreference: 'halal',
    },
    {
      id: 7,
      name: 'Amanda Taylor',
      email: 'amanda@email.com',
      phone: '+1-555-0111',
      side: 'Bride',
      plusOne: false,
      rsvpStatus: 'confirmed',
      mealPreference: 'kosher',
    },
    {
      id: 8,
      name: 'Chris Martinez',
      email: 'chris@email.com',
      phone: '+1-555-0222',
      side: 'Groom',
      plusOne: false,
      rsvpStatus: 'confirmed',
      mealPreference: 'pescatarian',
    },
    {
      id: 9,
      name: 'Lisa Anderson',
      email: 'lisa@email.com',
      phone: '+1-555-0333',
      side: 'Bride',
      plusOne: false,
      rsvpStatus: 'confirmed',
      mealPreference: 'nut-free',
    },
    {
      id: 10,
      name: 'James Thompson',
      email: 'james@email.com',
      phone: '+1-555-0444',
      side: 'Groom',
      plusOne: true,
      rsvpStatus: 'confirmed',
      mealPreference: 'dairy-free',
    },
  ]);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate meal preferences
  const mealPreferences: MealPreference[] = [
    {
      id: 'none',
      name: 'Standard',
      count: guests.filter(g => g.rsvpStatus === 'confirmed' && (!g.mealPreference || g.mealPreference === 'none')).length,
      icon: <Utensils size={24} />,
      color: 'blue',
      description: 'No special requirements',
    },
    {
      id: 'vegetarian',
      name: 'Vegetarian',
      count: guests.filter(g => g.rsvpStatus === 'confirmed' && g.mealPreference === 'vegetarian').length,
      icon: <Leaf size={24} />,
      color: 'green',
      description: 'No meat products',
    },
    {
      id: 'vegan',
      name: 'Vegan',
      count: guests.filter(g => g.rsvpStatus === 'confirmed' && g.mealPreference === 'vegan').length,
      icon: <Leaf size={24} />,
      color: 'emerald',
      description: 'No animal products',
    },
    {
      id: 'gluten-free',
      name: 'Gluten-Free',
      count: guests.filter(g => g.rsvpStatus === 'confirmed' && g.mealPreference === 'gluten-free').length,
      icon: <Wheat size={24} />,
      color: 'amber',
      description: 'No gluten-containing foods',
    },
    {
      id: 'pescatarian',
      name: 'Pescatarian',
      count: guests.filter(g => g.rsvpStatus === 'confirmed' && g.mealPreference === 'pescatarian').length,
      icon: <Fish size={24} />,
      color: 'cyan',
      description: 'Vegetarian + fish',
    },
    {
      id: 'halal',
      name: 'Halal',
      count: guests.filter(g => g.rsvpStatus === 'confirmed' && g.mealPreference === 'halal').length,
      icon: <Beef size={24} />,
      color: 'teal',
      description: 'Islamic dietary laws',
    },
    {
      id: 'kosher',
      name: 'Kosher',
      count: guests.filter(g => g.rsvpStatus === 'confirmed' && g.mealPreference === 'kosher').length,
      icon: <Check size={24} />,
      color: 'indigo',
      description: 'Jewish dietary laws',
    },
    {
      id: 'nut-free',
      name: 'Nut-Free',
      count: guests.filter(g => g.rsvpStatus === 'confirmed' && g.mealPreference === 'nut-free').length,
      icon: <AlertCircle size={24} />,
      color: 'red',
      description: 'Nut allergy - severe',
    },
    {
      id: 'dairy-free',
      name: 'Dairy-Free',
      count: guests.filter(g => g.rsvpStatus === 'confirmed' && g.mealPreference === 'dairy-free').length,
      icon: <AlertCircle size={24} />,
      color: 'orange',
      description: 'No dairy products',
    },
  ];

  // Calculate stats
  const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmed');
  const withDietaryRestrictions = confirmedGuests.filter(g => g.mealPreference && g.mealPreference !== 'none').length;
  const totalAllergies = mealPreferences.filter(m => ['nut-free', 'dairy-free', 'gluten-free'].includes(m.id)).reduce((sum, m) => sum + m.count, 0);

  // Filter guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPreference = filterPreference === 'all' || guest.mealPreference === filterPreference;
    return matchesSearch && matchesPreference && guest.rsvpStatus === 'confirmed';
  });

  const getPreferenceIcon = (preference?: string) => {
    switch (preference) {
      case 'vegetarian': return <Leaf size={18} className="text-green-500" />;
      case 'vegan': return <Leaf size={18} className="text-emerald-500" />;
      case 'gluten-free': return <Wheat size={18} className="text-amber-500" />;
      case 'pescatarian': return <Fish size={18} className="text-cyan-500" />;
      case 'halal': return <Beef size={18} className="text-teal-500" />;
      case 'kosher': return <Check size={18} className="text-indigo-500" />;
      case 'nut-free':
      case 'dairy-free': return <AlertCircle size={18} className="text-red-500" />;
      default: return <Utensils size={18} className="text-blue-500" />;
    }
  };

  const getPreferenceColor = (preference?: string) => {
    switch (preference) {
      case 'vegetarian': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'vegan': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'gluten-free': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'pescatarian': return 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30';
      case 'halal': return 'bg-teal-500/20 text-teal-500 border-teal-500/30';
      case 'kosher': return 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30';
      case 'nut-free': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'dairy-free': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      default: return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
    }
  };

  const getPreferenceLabel = (preference?: string) => {
    if (!preference || preference === 'none') return 'Standard';
    return preference.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
  };

  if (isLoading) {
    return <GuestLayoutSkeleton />;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          href="/dashboard/guests"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Guest Management</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="heading-emotional text-emotional-4xl text-text-primary mb-4">
            <span className="text-glow">Meal Preferences</span>
          </h1>
          <p className="body-emotional text-emotional-xl text-text-muted max-w-3xl">
            Track dietary requirements and meal choices for your wedding reception
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-ui text-ui-sm text-text-muted mb-1">Confirmed Guests</p>
                <p className="text-data-3xl font-bold text-primary">{confirmedGuests.length}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/20 text-primary">
                <Users size={24} />
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-ui text-ui-sm text-text-muted mb-1">With Dietary Restrictions</p>
                <p className="text-data-3xl font-bold text-secondary">{withDietaryRestrictions}</p>
              </div>
              <div className="p-3 rounded-full bg-secondary/20 text-secondary">
                <Utensils size={24} />
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-ui text-ui-sm text-text-muted mb-1">Allergy Concerns</p>
                <p className="text-data-3xl font-bold text-red-500">{totalAllergies}</p>
              </div>
              <div className="p-3 rounded-full bg-red-500/20 text-red-500">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Meal Preferences Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="heading-data text-data-2xl text-text-primary mb-6">Dietary Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {mealPreferences.map((pref) => (
              <motion.div
                key={pref.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setFilterPreference(pref.id === filterPreference ? 'all' : pref.id)}
                className={`glass-card p-4 cursor-pointer transition-all ${
                  filterPreference === pref.id ? 'border-primary bg-primary/10' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-full bg-${pref.color}-500/20 text-${pref.color}-500`}>
                    {pref.icon}
                  </div>
                  <span className={`text-data-xl font-bold text-${pref.color}-500`}>{pref.count}</span>
                </div>
                <h3 className="font-medium text-text-primary mb-1">{pref.name}</h3>
                <p className="text-xs text-text-muted">{pref.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Guest List with Meal Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="heading-data text-data-2xl text-text-primary">Guest Meal Preferences</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search guests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
                />
              </div>
              <select
                value={filterPreference}
                onChange={(e) => setFilterPreference(e.target.value)}
                className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="all">All Preferences</option>
                {mealPreferences.map(pref => (
                  <option key={pref.id} value={pref.id}>{pref.name}</option>
                ))}
              </select>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-lg text-text-primary hover:bg-white/5 transition-colors">
                <Download size={18} />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-text-muted font-medium">Guest</th>
                    <th className="text-left p-4 text-text-muted font-medium">Side</th>
                    <th className="text-left p-4 text-text-muted font-medium">Contact</th>
                    <th className="text-left p-4 text-text-muted font-medium">Meal Preference</th>
                    <th className="text-left p-4 text-text-muted font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                            {guest.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-text-primary font-medium">{guest.name}</p>
                            {guest.plusOne && (
                              <span className="text-xs text-primary">+1 Guest</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          guest.side === 'Bride' ? 'bg-pink-500/20 text-pink-500' : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          {guest.side}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-text-primary">{guest.email}</p>
                        <p className="text-text-muted text-sm">{guest.phone}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getPreferenceColor(guest.mealPreference)}`}>
                          {getPreferenceIcon(guest.mealPreference)}
                          <span>{getPreferenceLabel(guest.mealPreference)}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-text-muted text-sm">
                          {guest.mealPreference && guest.mealPreference !== 'none' 
                            ? `Requires ${getPreferenceLabel(guest.mealPreference).toLowerCase()} meal`
                            : 'No special requirements'
                          }
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredGuests.length === 0 && (
              <div className="p-8 text-center text-text-muted">
                <Utensils size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No guests found matching your criteria</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Important Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass-card p-6 mt-8"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-500">
              <Info size={24} />
            </div>
            <div>
              <h3 className="heading-data text-data-lg text-text-primary mb-2">Important Notes for Catering</h3>
              <ul className="space-y-2 text-text-muted">
                <li className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <span><strong>{totalAllergies} guests</strong> have severe allergies - ensure cross-contamination protocols</span>
                </li>
                <li className="flex items-center gap-2">
                  <Leaf size={16} className="text-green-500" />
                  <span><strong>{mealPreferences.find(p => p.id === 'vegan')?.count} vegan guests</strong> - strict no animal products policy</span>
                </li>
                <li className="flex items-center gap-2">
                  <Beef size={16} className="text-teal-500" />
                  <span><strong>{mealPreferences.find(p => p.id === 'halal')?.count} halal + {mealPreferences.find(p => p.id === 'kosher')?.count} kosher guests</strong> - religious dietary requirements</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
