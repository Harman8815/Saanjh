'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Calendar, 
  AlertCircle, 
  Clock, 
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '@/types/api';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onDuplicateTask?: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  selectedTasks?: number[];
  onSelectTask?: (taskId: number) => void;
  onSelectAll?: () => void;
}

export function TaskList({ 
  tasks, 
  isLoading = false,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onToggleComplete,
  selectedTasks = [],
  onSelectTask,
  onSelectAll
}: TaskListProps) {
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'review': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isOverdue = (task: Task) => task.is_overdue && task.status_name.toLowerCase() !== 'completed';

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-white/20 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-white/20 rounded w-1/2 mb-2"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-white/20 rounded w-20"></div>
              <div className="h-6 bg-white/20 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8">
          <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No tasks found</h3>
          <p className="text-gray-400">Create your first task to get started with wedding planning</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white/10 backdrop-blur-md border rounded-xl p-6 transition-all duration-200 ${
            isOverdue(task) 
              ? 'border-red-200 bg-red-50/10' 
              : 'border-white/20 hover:border-white/30'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {/* Checkbox */}
              <button
                onClick={() => onSelectTask?.(task.id)}
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedTasks.includes(task.id)
                    ? 'bg-primary border-primary'
                    : 'border-gray-400 hover:border-primary'
                }`}
              >
                {selectedTasks.includes(task.id) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`font-semibold text-text-primary ${
                    task.status_name.toLowerCase() === 'completed' ? 'line-through opacity-60' : ''
                  }`}>
                    {task.title}
                  </h3>
                  
                  {/* Priority Badge */}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority_name)}`}>
                    {task.priority_name}
                  </span>

                  {/* Status Badge */}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status_name)}`}>
                    {task.status_name}
                  </span>

                  {/* Overdue Indicator */}
                  {isOverdue(task) && (
                    <div className="flex items-center gap-1 text-red-500 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>Overdue</span>
                    </div>
                  )}
                </div>

                {task.description && (
                  <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Task Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                  {task.assigned_to_name && (
                    <div className="flex items-center gap-1">
                      <span>Assigned to: {task.assigned_to_name}</span>
                    </div>
                  )}

                  {task.due_date && (
                    <div className={`flex items-center gap-1 ${isOverdue(task) ? 'text-red-500' : ''}`}>
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}

                  {task.category_name && (
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        {task.category_name}
                      </span>
                    </div>
                  )}

                  {task.progress > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-xs">{task.progress}%</span>
                    </div>
                  )}

                  {task.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      {task.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(showDropdown === task.id ? null : task.id)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-text-secondary" />
              </button>

              {showDropdown === task.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white/95 backdrop-blur-md border border-white/20 rounded-lg shadow-lg z-10"
                >
                  <button
                    onClick={() => {
                      onEditTask?.(task);
                      setShowDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  
                  {task.status_name.toLowerCase() !== 'completed' && (
                    <button
                      onClick={() => {
                        onToggleComplete?.(task);
                        setShowDropdown(null);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                    >
                      <Check className="w-4 h-4" />
                      Mark Complete
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      onDuplicateTask?.(task);
                      setShowDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  
                  <div className="border-t border-gray-200 my-1"></div>
                  
                  <button
                    onClick={() => {
                      onDeleteTask?.(task);
                      setShowDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
