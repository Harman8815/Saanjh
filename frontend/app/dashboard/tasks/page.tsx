'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  AlertTriangle,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { TaskList } from '@/components/dashboard/tasks/TaskList';
import { TaskModal } from '@/components/dashboard/tasks/TaskModal';
import { DeleteTaskModal } from '@/components/dashboard/tasks/DeleteTaskModal';
import { 
  useTasks, 
  useTaskStatistics, 
  useCreateTask, 
  useUpdateTask, 
  useDeleteTask, 
  useBulkDeleteTasks,
  useMarkTaskComplete,
  useDuplicateTask
} from '@/hooks/useTasks';
import { TaskService } from '@/services';
import type { Task, TaskStatus, TaskPriority, TaskCategory } from '@/types/api';

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>();
  const [selectedPriority, setSelectedPriority] = useState<number | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Fetch tasks with filters
  const { tasks, pagination, isLoading, mutate } = useTasks(
    currentPage, 
    20, 
    {
      search: searchQuery || undefined,
      status: selectedStatus,
      priority: selectedPriority,
      category: selectedCategory,
    }
  );

  // Fetch statistics
  const { statistics } = useTaskStatistics();

  // Fetch dropdown data
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [users, setUsers] = useState<Array<{ id: number; first_name: string; last_name: string }>>([]);

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const bulkDeleteMutation = useBulkDeleteTasks();
  const markCompleteMutation = useMarkTaskComplete();
  const duplicateTaskMutation = useDuplicateTask();

  useEffect(() => {
    // Load dropdown data
    const loadDropdownData = async () => {
      try {
        const [statusesData, prioritiesData, categoriesData] = await Promise.all([
          TaskService.getTaskStatuses(),
          TaskService.getTaskPriorities(),
          TaskService.getTaskCategories(),
        ]);
        setStatuses(statusesData);
        setPriorities(prioritiesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load dropdown data:', error);
      }
    };

    loadDropdownData();
  }, []);

  const handleCreateTask = async (data: any) => {
    try {
      await createTaskMutation.mutateAsync(data);
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    
    try {
      await updateTaskMutation.mutateAsync({ taskId: editingTask.id, taskData: data });
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    
    try {
      await deleteTaskMutation.mutateAsync(deletingTask.id);
      setShowDeleteModal(false);
      setDeletingTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await markCompleteMutation.mutateAsync(task.id);
    } catch (error) {
      console.error('Failed to mark task complete:', error);
    }
  };

  const handleDuplicateTask = async (task: Task) => {
    try {
      await duplicateTaskMutation.mutateAsync(task.id);
    } catch (error) {
      console.error('Failed to duplicate task:', error);
    }
  };

  const handleSelectTask = (taskId: number) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    
    try {
      await bulkDeleteMutation.mutateAsync(selectedTasks);
      setSelectedTasks([]);
    } catch (error) {
      console.error('Failed to bulk delete tasks:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Tasks</h1>
          <p className="text-text-secondary">Manage your wedding planning tasks and checklists</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-text-primary mb-2">{statistics.total_count}</div>
              <div className="text-text-secondary text-sm">Total Tasks</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-amber-500 mb-2">{statistics.overdue_count}</div>
              <div className="text-text-secondary text-sm">Overdue</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-500 mb-2">{statistics.due_soon_count}</div>
              <div className="text-text-secondary text-sm">Due Soon</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-500 mb-2">{statistics.recent_count}</div>
              <div className="text-text-secondary text-sm">Recent</div>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-primary text-white' 
                    : 'bg-white/10 border border-white/20 text-text-primary hover:bg-white/20'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Task
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/20 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
                <select
                  value={selectedStatus || ''}
                  onChange={(e) => setSelectedStatus(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
                <select
                  value={selectedPriority || ''}
                  onChange={(e) => setSelectedPriority(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
                >
                  <option value="">All Priorities</option>
                  {priorities.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-amber-800 font-medium">
                {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </motion.div>
        )}

        {/* Task List */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onEditTask={(task) => {
            setEditingTask(task);
            setShowTaskModal(true);
          }}
          onDeleteTask={(task) => {
            setDeletingTask(task);
            setShowDeleteModal(true);
          }}
          onDuplicateTask={handleDuplicateTask}
          onToggleComplete={handleToggleComplete}
          selectedTasks={selectedTasks}
          onSelectTask={handleSelectTask}
          onSelectAll={handleSelectAll}
        />
      </motion.div>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        statuses={statuses}
        priorities={priorities}
        categories={categories}
        users={users}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      {/* Delete Modal */}
      <DeleteTaskModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingTask(null);
        }}
        onConfirm={handleDeleteTask}
        task={deletingTask}
        isLoading={deleteTaskMutation.isPending}
      />
    </div>
  );
}
