import { apiClient } from './api';
import { 
  Expense, 
  ExpenseStatistics,
  BulkPaymentUpdate,
  PaginatedResponse 
} from '../types/api';

export class ExpenseService {
  // Get all expenses
  static async getExpenses(page = 1, pageSize = 20): Promise<PaginatedResponse<Expense>> {
    return apiClient.get<PaginatedResponse<Expense>>(`/expenses/?page=${page}&page_size=${pageSize}`);
  }

  // Create new expense
  static async createExpense(expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
    return apiClient.post<Expense>('/expenses/', expenseData);
  }

  // Get expense by ID
  static async getExpense(expenseId: number): Promise<Expense> {
    return apiClient.get<Expense>(`/expenses/${expenseId}/`);
  }

  // Update expense
  static async updateExpense(expenseId: number, expenseData: Partial<Expense>): Promise<Expense> {
    return apiClient.patch<Expense>(`/expenses/${expenseId}/`, expenseData);
  }

  // Delete expense
  static async deleteExpense(expenseId: number): Promise<void> {
    return apiClient.delete(`/expenses/${expenseId}/`);
  }

  // Bulk payment update
  static async bulkPaymentUpdate(bulkData: BulkPaymentUpdate): Promise<void> {
    return apiClient.post('/expenses/bulk-payment-update/', bulkData);
  }

  // Get expense statistics
  static async getStatistics(): Promise<ExpenseStatistics> {
    return apiClient.get<ExpenseStatistics>('/expenses/statistics/');
  }

  // Get overdue expenses
  static async getOverdueExpenses(): Promise<Expense[]> {
    return apiClient.get<Expense[]>('/expenses/overdue/');
  }

  // Get upcoming expenses
  static async getUpcomingExpenses(days = 30): Promise<Expense[]> {
    return apiClient.get<Expense[]>(`/expenses/upcoming/?days=${days}`);
  }

  // Get expense summary
  static async getExpenseSummary(): Promise<any> {
    return apiClient.get('/expenses/summary/');
  }

  // Search expenses
  static async searchExpenses(query: string): Promise<Expense[]> {
    return apiClient.get<Expense[]>(`/expenses/?search=${query}`);
  }

  // Filter expenses by category
  static async filterExpensesByCategory(category: string): Promise<Expense[]> {
    return apiClient.get<Expense[]>(`/expenses/?category=${category}`);
  }

  // Filter expenses by payment status
  static async filterExpensesByPaymentStatus(paid: boolean): Promise<Expense[]> {
    return apiClient.get<Expense[]>(`/expenses/?paid=${paid}`);
  }
}

export default ExpenseService;
