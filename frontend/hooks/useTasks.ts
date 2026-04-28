'use client';

import useSWR from 'swr';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '../services';
import type { Task, TaskStatistics, PaginatedResponse, TaskCreateRequest, TaskUpdateRequest, TaskBulkUpdateRequest } from '../types/api';

// Fetch tasks with pagination and filters
export function useTasks(page = 1, pageSize = 20, filters?: {
  status?: number;
  priority?: number;
  category?: number;
  assigned_to?: number;
  search?: string;
  tags?: string[];
  is_completed?: boolean;
  is_overdue?: boolean;
  due_date_from?: string;
  due_date_to?: string;
}) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Task>>(
    `tasks-${page}-${pageSize}-${JSON.stringify(filters || {})}`,
    () => TaskService.getTasks(page, pageSize, filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    tasks: data?.results || [],
    pagination: data ? {
      count: data.count,
      next: data.next,
      previous: data.previous,
      currentPage: page,
      totalPages: Math.ceil(data.count / pageSize),
    } : null,
    isLoading,
    error,
    mutate,
  };
}

// Fetch single task
export function useTask(taskId: number) {
  const { data, error, isLoading, mutate } = useSWR<Task>(
    taskId ? `task-${taskId}` : null,
    () => TaskService.getTask(taskId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    task: data,
    isLoading,
    error,
    mutate,
  };
}

// Fetch task statistics
export function useTaskStatistics() {
  const { data, error, isLoading, mutate } = useSWR<TaskStatistics>(
    'task-statistics',
    () => TaskService.getTaskStatistics(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    statistics: data,
    isLoading,
    error,
    mutate,
  };
}

// Search tasks
export function useSearchTasks(query: string, filters?: {
  status?: number;
  priority?: number;
  category?: number;
}) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Task>>(
    query ? `search-tasks-${query}-${JSON.stringify(filters || {})}` : null,
    () => TaskService.searchTasks(query, filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    tasks: data?.results || [],
    isLoading,
    error,
    mutate,
  };
}

// Filter tasks by tags
export function useFilterTasksByTags(tags: string[]) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Task>>(
    tags.length > 0 ? `tasks-by-tags-${tags.join(',')}` : null,
    () => TaskService.filterTasksByTags(tags),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    tasks: data?.results || [],
    isLoading,
    error,
    mutate,
  };
}

// Get overdue tasks
export function useOverdueTasks() {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Task>>(
    'overdue-tasks',
    () => TaskService.getOverdueTasks(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    tasks: data?.results || [],
    isLoading,
    error,
    mutate,
  };
}

// Get tasks due soon
export function useTasksDueSoon() {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Task>>(
    'tasks-due-soon',
    () => TaskService.getTasksDueSoon(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    tasks: data?.results || [],
    isLoading,
    error,
    mutate,
  };
}

// Get recent tasks
export function useRecentTasks() {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Task>>(
    'recent-tasks',
    () => TaskService.getRecentTasks(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    tasks: data?.results || [],
    isLoading,
    error,
    mutate,
  };
}

// Create task mutation
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, TaskCreateRequest>({
    mutationFn: (taskData) => TaskService.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] });
    },
  });
}

// Update task mutation
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { taskId: number; taskData: TaskUpdateRequest }>({
    mutationFn: ({ taskId, taskData }) => TaskService.updateTask(taskId, taskData),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] });
      queryClient.invalidateQueries({ queryKey: [`task-${taskId}`] });
    },
  });
}

// Delete task mutation
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (taskId) => TaskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] });
    },
  });
}

// Bulk delete tasks mutation
export function useBulkDeleteTasks() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted_count: number }, Error, number[]>({
    mutationFn: (taskIds) => TaskService.bulkDeleteTasks(taskIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] });
    },
  });
}

// Bulk update tasks mutation
export function useBulkUpdateTasks() {
  const queryClient = useQueryClient();

  return useMutation<{ updated_count: number }, Error, TaskBulkUpdateRequest>({
    mutationFn: (request) => TaskService.bulkUpdateTasks(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] });
    },
  });
}

// Mark task complete mutation
export function useMarkTaskComplete() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, number>({
    mutationFn: (taskId) => TaskService.markTaskComplete(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] });
      queryClient.invalidateQueries({ queryKey: [`task-${taskId}`] });
    },
  });
}

// Duplicate task mutation
export function useDuplicateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, number>({
    mutationFn: (taskId) => TaskService.duplicateTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] });
    },
  });
}
