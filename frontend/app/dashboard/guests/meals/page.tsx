'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Users, ArrowLeft, Search, Download, Filter, Leaf, Wheat, Beef, Fish, AlertCircle, Info, Check, PieChart } from 'lucide-react';
import Link from 'next/link';
import GuestLayoutSkeleton from '../../../../components/dashboard/GuestLayoutSkeleton';
import { Guest, Meal } from '../../../../types/api';
import { GuestService } from '../../../../services/guests';
import toast from 'react-hot-toast';

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

  const [guests, setGuests] = useState<Guest[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch guests and meals in parallel
        const [guestsResponse, mealsResponse] = await Promise.all([
          GuestService.getGuests(1, 1000), // Get all guests
          GuestService.getMeals()
        ]);
        
        const guestsArray = Array.isArray(guestsResponse) ? guestsResponse : (guestsResponse.results || []);
        setGuests(guestsArray);
        setMeals(mealsResponse);
      } catch (err: any) {
        console.error('Error fetching meal preferences data:', err);
        setError(err.message || 'Failed to load meal preferences');
        toast.error('Failed to load meal preferences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate meal preferences from API data
  const mealPreferences: MealPreference[] = meals.map((meal) => ({
    id: meal.id.toString(),
    name: meal.name,
    count: guests.filter(g => 
      g.rsvp_status?.name === 'confirmed' && 
      g.meal_preferences?.some(mp => mp.id === meal.id)
    ).length,
    icon: getMealIcon(meal.name),
    color: getMealColor(meal.name),
    description: `${meal.name} meal preference`,
  }));

  // Add standard meal option for guests with no preferences
  const standardMealCount = guests.filter(g => 
    g.rsvp_status?.name === 'confirmed' && 
    (!g.meal_preferences || g.meal_preferences.length === 0)
  ).length;
  
  mealPreferences.unshift({
    id: 'none',
    name: 'Standard',
    count: standardMealCount,
    icon: <Utensils size={24} />,
    color: 'blue',
    description: 'No special requirements',
  });

  // Calculate stats
  const confirmedGuests = guests.filter(g => g.rsvp_status?.name === 'confirmed');
  const withDietaryRestrictions = confirmedGuests.filter(g => g.meal_preferences && g.meal_preferences.length > 0).length;
  const totalAllergies = mealPreferences.filter(m => ['nut-free', 'dairy-free', 'gluten-free'].includes(m.id)).reduce((sum, m) => sum + m.count, 0);

  // Filter guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPreference = filterPreference === 'all' || 
      (filterPreference === 'none' ? 
        (!guest.meal_preferences || guest.meal_preferences.length === 0) :
        guest.meal_preferences?.some(mp => mp.id.toString() === filterPreference)
      );
    return matchesSearch && matchesPreference && guest.rsvp_status?.name === 'confirmed';
  });

  const getPreferenceIcon = (mealPreferences?: any[]) => {
    if (!mealPreferences || mealPreferences.length === 0) {
      return <Utensils size={18} className="text-blue-500" />;
    }
    const mealName = mealPreferences[0].name?.toLowerCase() || '';
    return getMealIcon(mealName);
  };

  const getPreferenceColor = (mealPreferences?: any[]) => {
    if (!mealPreferences || mealPreferences.length === 0) {
      return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
    }
    return getMealColor(mealPreferences[0].name);
  };

  const getPreferenceLabel = (mealPreferences?: any[]) => {
    if (!mealPreferences || mealPreferences.length === 0) {
      return 'Standard';
    }
    return mealPreferences[0].name;
  };

  // Helper functions for meal icons and colors
  const getMealIcon = (mealName: string) => {
    const name = mealName.toLowerCase();
    if (name.includes('vegetarian')) return <Leaf size={24} className="text-green-500" />;
    if (name.includes('vegan')) return <Leaf size={24} className="text-emerald-500" />;
    if (name.includes('gluten')) return <Wheat size={24} className="text-amber-500" />;
    if (name.includes('pescatarian') || name.includes('fish')) return <Fish size={24} className="text-cyan-500" />;
    if (name.includes('halal')) return <Beef size={24} className="text-teal-500" />;
    if (name.includes('kosher')) return <Check size={24} className="text-indigo-500" />;
    if (name.includes('nut') || name.includes('dairy')) return <AlertCircle size={24} className="text-red-500" />;
    return <Utensils size={24} className="text-blue-500" />;
  };

  const getMealColor = (mealName: string) => {
    const name = mealName.toLowerCase();
    if (name.includes('vegetarian')) return 'green';
    if (name.includes('vegan')) return 'emerald';
    if (name.includes('gluten')) return 'amber';
    if (name.includes('pescatarian') || name.includes('fish')) return 'cyan';
    if (name.includes('halal')) return 'teal';
    if (name.includes('kosher')) return 'indigo';
    if (name.includes('nut') || name.includes('dairy')) return 'red';
    return 'blue';
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
                            {guest.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-text-primary font-medium">{guest.full_name || 'Unknown'}</p>
                            <span className="text-xs text-primary">{guest.relationship}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          guest.relationship?.toLowerCase().includes('bride') ? 'bg-pink-500/20 text-pink-500' : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          {guest.relationship || 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-text-primary">{guest.email || '--'}</p>
                        <p className="text-text-muted text-sm">{guest.phone || '--'}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getPreferenceColor(guest.meal_preferences)}`}>
                          {getPreferenceIcon(guest.meal_preferences)}
                          <span>{getPreferenceLabel(guest.meal_preferences)}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-text-muted text-sm">
                          {guest.meal_preferences && guest.meal_preferences.length > 0 
                            ? `Requires ${getPreferenceLabel(guest.meal_preferences).toLowerCase()} meal`
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
