'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Tag, Flag, CheckSquare, MessageSquare, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import useSWR from 'swr';
import { TaskService } from '@/services/tasks';
import type { TaskCreateRequest, TaskUpdateRequest, Task, TaskStatus, TaskPriority, TaskCategory } from '@/types/api';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.number().optional(),
  priority: z.number().optional(),
  category: z.number().optional(),
  assigned_to: z.number().optional(),
  due_date: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  parent: z.number().optional(),
  depends_on: z.array(z.number()).optional(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']),
  recurrence_interval: z.number().int().min(1),
  recurrence_ends_on: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreateRequest | TaskUpdateRequest) => void;
  task?: Task | null;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  categories: TaskCategory[];
  users: Array<{ id: number; first_name: string; last_name: string }>;
  allTasks?: Task[];
  isLoading?: boolean;
}

export function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  statuses,
  priorities,
  categories,
  users,
  allTasks = [],
  isLoading = false
}: TaskModalProps) {
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 1, // Default to "To Do"
      priority: 2, // Default to "Medium"
      category: undefined,
      assigned_to: undefined,
      due_date: '',
      progress: 0,
      tags: [],
      parent: undefined,
      depends_on: [],
      recurrence: 'none',
      recurrence_interval: 1,
      recurrence_ends_on: '',
    }
  });

  const progress = watch('progress');
  const recurrence = watch('recurrence');
  const dependencies = watch('depends_on') || [];
  const { data: comments = [], mutate: refreshComments } = useSWR(
    isOpen && task ? `task-comments-${task.id}` : null,
    () => TaskService.getTaskComments(task!.id),
    { revalidateOnFocus: false }
  );
  const [commentDraft, setCommentDraft] = useState('');

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status.id,
        priority: task.priority.id,
        category: task.category?.id,
        assigned_to: task.assigned_to?.id,
        due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd\'T\'HH:mm') : '',
        progress: task.progress,
        tags: task.tags,
        parent: task.parent || undefined,
        depends_on: task.depends_on.map(dependency => typeof dependency === 'number' ? dependency : dependency.id),
        recurrence: task.recurrence || 'none',
        recurrence_interval: task.recurrence_interval || 1,
        recurrence_ends_on: task.recurrence_ends_on || '',
        parent: undefined,
        depends_on: [],
        recurrence: 'none',
        recurrence_interval: 1,
        recurrence_ends_on: '',
      });
      setSelectedTags(task.tags);
    } else {
      reset();
      setSelectedTags([]);
    }
  }, [task, reset]);

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      const newTags = [...selectedTags, tagInput.trim()];
      setSelectedTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    setValue('tags', newTags);
  };

  const handleFormSubmit = (data: TaskFormData) => {
    const submitData = {
      ...data,
      tags: selectedTags,
    };
    onSubmit(submitData);
  };

  const handleAddComment = async () => {
    if (!task || !commentDraft.trim()) return;
    await TaskService.addTaskComment(task.id, commentDraft.trim());
    setCommentDraft('');
    await refreshComments();
  };

  const cycleRisk = task && allTasks.some(candidate =>
    dependencies.includes(candidate.id) && candidate.dependent_tasks?.some(dependent => dependent.id === task.id)
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter task description"
              />
            </div>

            {/* Status, Priority, Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CheckSquare className="w-4 h-4 inline mr-1" />
                  Status
                </label>
                <select
                  {...register('status', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Flag className="w-4 h-4 inline mr-1" />
                  Priority
                </label>
                <select
                  {...register('priority', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {priorities.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  {...register('category', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assigned To and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Assigned To
                </label>
                <select
                  {...register('assigned_to', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select person</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  {...register('due_date')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Parent task</label>
                <select {...register('parent', { valueAsNumber: true })} className="w-full rounded-lg border border-gray-300 px-4 py-2">
                  <option value="">No parent</option>
                  {allTasks.filter(item => item.id !== task?.id).map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
                {task?.subtasks?.length ? <p className="mt-2 text-xs text-gray-500">Subtasks: {task.subtasks.map(item => item.title).join(', ')}</p> : null}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Dependencies</label>
                <select
                  multiple
                  value={dependencies.map(String)}
                  onChange={event => setValue('depends_on', Array.from(event.target.selectedOptions, option => Number(option.value)))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  aria-label="Task dependencies"
                >
                  {allTasks.filter(item => item.id !== task?.id).map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
                {cycleRisk && <p role="alert" className="mt-1 flex items-center gap-1 text-xs text-amber-700"><AlertTriangle className="h-3.5 w-3.5" />This selection may create a dependency cycle.</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Recurrence</label>
                <select {...register('recurrence')} className="w-full rounded-lg border border-gray-300 px-4 py-2">
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              {recurrence !== 'none' && <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Repeat every</label>
                  <input type="number" min="1" {...register('recurrence_interval', { valueAsNumber: true })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Ends on</label>
                  <input type="date" {...register('recurrence_ends_on')} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
                </div>
              </>}
            </div>

            {/* Progress */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress: {progress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                {...register('progress', { valueAsNumber: true })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {task && (
              <section className="border-t border-gray-200 pt-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800"><MessageSquare className="h-4 w-4" />Comments</h3>
                <div className="mb-3 max-h-36 space-y-2 overflow-y-auto">
                  {comments.map(comment => <p key={comment.id} className="text-sm text-gray-600"><span className="font-medium text-gray-800">{comment.author_name || 'Planner'}:</span> {comment.body}</p>)}
                  {comments.length === 0 && <p className="text-sm text-gray-500">No comments yet.</p>}
                </div>
                <div className="flex gap-2">
                  <input value={commentDraft} onChange={event => setCommentDraft(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Write a comment" />
                  <button type="button" onClick={handleAddComment} disabled={!commentDraft.trim()} className="rounded-lg bg-primary px-3 py-2 text-sm text-white disabled:opacity-40">Add</button>
                </div>
              </section>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
