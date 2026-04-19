'use client';

import { motion } from 'framer-motion';
import { CheckSquare, Clock, AlertCircle, Calendar } from 'lucide-react';

export default function TasksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Tasks</h1>
          <p className="text-text-secondary">Manage your wedding planning tasks and checklists</p>
        </div>

        {/* Under Construction Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-amber-100 dark:bg-amber-800/30 p-4 rounded-full">
              <AlertCircle className="w-12 h-12 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-amber-800 dark:text-amber-200 mb-3">
            Under Construction
          </h2>
          
          <p className="text-amber-700 dark:text-amber-300 mb-6 max-w-md mx-auto">
            This feature is currently being developed and will be available soon. We're working hard to bring you comprehensive task management tools for your wedding planning.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              <span>Task Lists</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Checklists</span>
            </div>
          </div>
        </motion.div>

        {/* Coming Soon Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <CheckSquare className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold text-text-primary mb-2">Task Management</h3>
            <p className="text-text-secondary text-sm">Create, organize, and track all your wedding planning tasks</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <Calendar className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold text-text-primary mb-2">Timeline Planning</h3>
            <p className="text-text-secondary text-sm">Set deadlines and milestones for your wedding journey</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <Clock className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold text-text-primary mb-2">Progress Tracking</h3>
            <p className="text-text-secondary text-sm">Monitor your progress and stay on schedule</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
