'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, PieChart as PieChartIcon, History } from 'lucide-react';
import { TabType } from './types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'budget' as TabType, label: 'Budget', icon: LayoutDashboard },
  { id: 'demographics' as TabType, label: 'Demographics', icon: PieChartIcon },
  { id: 'history' as TabType, label: 'History', icon: History }
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.05 }}
      className="mb-8"
    >
      <div className="inline-flex p-1.5 rounded-2xl bg-surface/50 border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-background'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
