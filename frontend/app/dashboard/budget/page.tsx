'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Camera, Flower, Utensils, Music } from 'lucide-react';

export default function BudgetTrackerPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [transactions, setTransactions] = useState([
    { id: 1, category: 'Venue', amount: 3000, date: '2024-04-10', description: 'Grand Ballroom deposit' },
    { id: 2, category: 'Photography', amount: 1500, date: '2024-04-15', description: 'Capture Moments booking' },
    { id: 3, category: 'Flowers', amount: 800, date: '2024-04-20', description: 'Bloom Florists deposit' },
    { id: 4, category: 'Catering', amount: 2500, date: '2024-04-25', description: 'Delicious Catering deposit' },
    { id: 5, category: 'Music', amount: 600, date: '2024-05-01', description: 'Sweet Harmony DJ booking' }
  ]);

  const budget = {
    total: 10000,
    spent: 8400,
    remaining: 1600,
    categories: {
      venue: 3000,
      photography: 1500,
      flowers: 800,
      catering: 2500,
      music: 600
    }
  };

  const categories = [
    { key: 'venue', label: 'Venue', icon: <Building size={24} />, color: 'primary' },
    { key: 'photography', label: 'Photography', icon: <Camera size={24} />, color: 'secondary' },
    { key: 'flowers', label: 'Flowers', icon: <Flower size={24} />, color: 'accent' },
    { key: 'catering', label: 'Catering', icon: <Utensils size={24} />, color: 'gold' },
    { key: 'music', label: 'Music', icon: <Music size={24} />, color: 'bronze' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            <span className="text-glow">Budget Tracker</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Manage your wedding expenses and track your spending
          </p>
        </motion.div>

        {/* Budget Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="glass-card p-8 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-text-muted mb-2">Total Budget</h3>
              <p className="text-3xl font-bold text-primary">${budget.total.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <h3 className="text-text-muted mb-2">Spent</h3>
              <p className="text-3xl font-bold text-warning">${budget.spent.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <h3 className="text-text-muted mb-2">Remaining</h3>
              <p className="text-3xl font-bold text-success">${budget.remaining.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-text-muted mb-2">
              <span>Budget Usage</span>
              <span>{Math.round((budget.spent / budget.total) * 100)}%</span>
            </div>
            <div className="w-full bg-surface rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-4 rounded-full transition-all duration-500"
                style={{ width: `${(budget.spent / budget.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card p-2 mb-8"
        >
          <div className="flex gap-4">
            {['overview', 'transactions', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedTab === tab
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="glass-card p-8"
        >
          {selectedTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-semibold text-text-primary mb-6">Category Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <div key={category.key} className="glass-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {category.icon}
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">{category.label}</h3>
                        <p className="text-2xl font-bold text-${category.color}">
                          ${budget.categories[category.key as keyof typeof budget.categories]?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div 
                        className={`bg-${category.color} h-2 rounded-full transition-all duration-500`}
                        style={{ 
                          width: `${(budget.categories[category.key as keyof typeof budget.categories] || 0) / budget.total * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'transactions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-text-primary">Recent Transactions</h2>
                <button className="btn-primary">Add Transaction</button>
              </div>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-surface rounded-lg">
                    <div>
                      <h4 className="text-text-primary font-medium">{transaction.category}</h4>
                      <p className="text-text-muted text-sm">{transaction.description}</p>
                      <p className="text-text-muted text-xs">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-warning">-${transaction.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-semibold text-text-primary mb-6">Budget Reports</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Spending</h3>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-warning">$2,800</p>
                    <p className="text-text-muted">Average per month</p>
                  </div>
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Top Categories</h3>
                  <div className="space-y-2">
                    {Object.entries(budget.categories).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-text-muted capitalize">{key}:</span>
                        <span className="text-primary font-medium">${value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* TODO: Add expense categories */}
        {/* TODO: Add budget planning tools */}
        {/* TODO: Add savings goals */}
        {/* TODO: Add financial reports */}
      </div>
    </div>
  );
}
