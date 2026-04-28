import { apiClient } from './api';
import type { 
  Task, 
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TaskStatistics,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskBulkUpdateRequest,
  PaginatedResponse 
} from '../types/api';

export class TaskService {
  // Task CRUD operations
  static async getTasks(page = 1, pageSize = 20, filters?: {
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
  }): Promise<PaginatedResponse<Task>> {
    let url = `/tasks/tasks/?page=${page}&page_size=${pageSize}`;
    
    if (filters) {
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.priority) url += `&priority=${filters.priority}`;
      if (filters.category) url += `&category=${filters.category}`;
      if (filters.assigned_to) url += `&assigned_to=${filters.assigned_to}`;
      if (filters.search) url += `&search=${filters.search}`;
      if (filters.is_completed !== undefined) url += `&is_completed=${filters.is_completed}`;
      if (filters.is_overdue !== undefined) url += `&is_overdue=${filters.is_overdue}`;
      if (filters.due_date_from) url += `&due_date_from=${filters.due_date_from}`;
      if (filters.due_date_to) url += `&due_date_to=${filters.due_date_to}`;
      
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => url += `&tags=${tag}`);
      }
    }
    
    return apiClient.get<PaginatedResponse<Task>>(url);
  }

  static async getTask(taskId: number): Promise<Task> {
    return apiClient.get<Task>(`/tasks/tasks/${taskId}/`);
  }

  static async createTask(taskData: TaskCreateRequest): Promise<Task> {
    return apiClient.post<Task>('/tasks/tasks/', taskData);
  }

  static async updateTask(taskId: number, taskData: TaskUpdateRequest): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/tasks/${taskId}/`, taskData);
  }

  static async deleteTask(taskId: number): Promise<void> {
    return apiClient.delete<void>(`/tasks/tasks/${taskId}/`);
  }

  static async bulkDeleteTasks(taskIds: number[]): Promise<{ deleted_count: number }> {
    return apiClient.post<{ deleted_count: number }>('/tasks/tasks/bulk_delete/', {
      task_ids: taskIds
    });
  }

  static async bulkUpdateTasks(request: TaskBulkUpdateRequest): Promise<{ updated_count: number }> {
    return apiClient.post<{ updated_count: number }>('/tasks/tasks/bulk_update/', request);
  }

  // Task status operations
  static async getTaskStatuses(): Promise<TaskStatus[]> {
    return apiClient.get<TaskStatus[]>('/tasks/statuses/');
  }

  static async createTaskStatus(statusData: Omit<TaskStatus, 'id'>): Promise<TaskStatus> {
    return apiClient.post<TaskStatus>('/tasks/statuses/', statusData);
  }

  static async updateTaskStatus(statusId: number, statusData: Partial<TaskStatus>): Promise<TaskStatus> {
    return apiClient.patch<TaskStatus>(`/tasks/statuses/${statusId}/`, statusData);
  }

  static async deleteTaskStatus(statusId: number): Promise<void> {
    return apiClient.delete<void>(`/tasks/statuses/${statusId}/`);
  }

  // Task priority operations
  static async getTaskPriorities(): Promise<TaskPriority[]> {
    return apiClient.get<TaskPriority[]>('/tasks/priorities/');
  }

  static async createTaskPriority(priorityData: Omit<TaskPriority, 'id'>): Promise<TaskPriority> {
    return apiClient.post<TaskPriority>('/tasks/priorities/', priorityData);
  }

  static async updateTaskPriority(priorityId: number, priorityData: Partial<TaskPriority>): Promise<TaskPriority> {
    return apiClient.patch<TaskPriority>(`/tasks/priorities/${priorityId}/`, priorityData);
  }

  static async deleteTaskPriority(priorityId: number): Promise<void> {
    return apiClient.delete<void>(`/tasks/priorities/${priorityId}/`);
  }

  // Task category operations
  static async getTaskCategories(): Promise<TaskCategory[]> {
    return apiClient.get<TaskCategory[]>('/tasks/categories/');
  }

  static async createTaskCategory(categoryData: Omit<TaskCategory, 'id'>): Promise<TaskCategory> {
    return apiClient.post<TaskCategory>('/tasks/categories/', categoryData);
  }

  static async updateTaskCategory(categoryId: number, categoryData: Partial<TaskCategory>): Promise<TaskCategory> {
    return apiClient.patch<TaskCategory>(`/tasks/categories/${categoryId}/`, categoryData);
  }

  static async deleteTaskCategory(categoryId: number): Promise<void> {
    return apiClient.delete<void>(`/tasks/categories/${categoryId}/`);
  }

  // Task statistics
  static async getTaskStatistics(): Promise<TaskStatistics> {
    return apiClient.get<TaskStatistics>('/tasks/tasks/statistics/');
  }

  // Tasks grouped by status
  static async getTasksByStatus(): Promise<Record<number, {
    name: string;
    color: string;
    count: number;
    tasks: Task[];
  }>> {
    return apiClient.get<Record<number, {
      name: string;
      color: string;
      count: number;
      tasks: Task[];
    }>>('/tasks/tasks/by_status/');
  }

  // Task specific actions
  static async markTaskComplete(taskId: number): Promise<Task> {
    return apiClient.post<Task>(`/tasks/tasks/${taskId}/mark_complete/`);
  }

  static async duplicateTask(taskId: number): Promise<Task> {
    return apiClient.post<Task>(`/tasks/tasks/${taskId}/duplicate/`);
  }

  // Search tasks
  static async searchTasks(query: string, filters?: {
    status?: number;
    priority?: number;
    category?: number;
  }): Promise<PaginatedResponse<Task>> {
    let url = `/tasks/tasks/?search=${query}`;
    
    if (filters) {
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.priority) url += `&priority=${filters.priority}`;
      if (filters.category) url += `&category=${filters.category}`;
    }
    
    return apiClient.get<PaginatedResponse<Task>>(url);
  }

  // Filter tasks by tags
  static async filterTasksByTags(tags: string[]): Promise<PaginatedResponse<Task>> {
    const url = `/tasks/tasks/?${tags.map(tag => `tags=${tag}`).join('&')}`;
    return apiClient.get<PaginatedResponse<Task>>(url);
  }

  // Get overdue tasks
  static async getOverdueTasks(): Promise<PaginatedResponse<Task>> {
    return apiClient.get<PaginatedResponse<Task>>('/tasks/tasks/?is_overdue=true');
  }

  // Get tasks due soon (next 7 days)
  static async getTasksDueSoon(): Promise<PaginatedResponse<Task>> {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return apiClient.get<PaginatedResponse<Task>>(
      `/tasks/tasks/?due_date_from=${today}&due_date_to=${nextWeek}&is_completed=false`
    );
  }

  // Get recently created tasks (last 7 days)
  static async getRecentTasks(): Promise<PaginatedResponse<Task>> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return apiClient.get<PaginatedResponse<Task>>(
      `/tasks/tasks/?created_at__gte=${sevenDaysAgo}`
    );
  }

  // Get users for task assignment
  static async getUsers(): Promise<Array<{ id: number; first_name: string; last_name: string; username: string }>> {
    return apiClient.get('/auth/users/');
  }
}
