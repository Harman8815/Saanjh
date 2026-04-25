import { apiClient } from './api';
import { 
  Expense, 
  BudgetCategory,
  ExpenseStatus,
  ExpenseStatistics,
  BulkPaymentUpdate,
  ExpenseCreateRequest,
  PaginatedResponse 
} from '../types/api';

export class ExpenseService {
  // Expense CRUD operations
  static async getExpenses(page = 1, pageSize = 20): Promise<PaginatedResponse<Expense>> {
    return apiClient.get<PaginatedResponse<Expense>>(`/expenses/?page=${page}&page_size=${pageSize}`);
  }

  static async createExpense(expenseData: ExpenseCreateRequest): Promise<Expense> {
    return apiClient.post<Expense>('/expenses/', expenseData);
  }

  static async getExpense(expenseId: number): Promise<Expense> {
    return apiClient.get<Expense>(`/expenses/${expenseId}/`);
  }

  static async updateExpense(expenseId: number, expenseData: Partial<Expense>): Promise<Expense> {
    return apiClient.patch<Expense>(`/expenses/${expenseId}/`, expenseData);
  }

  static async deleteExpense(expenseId: number): Promise<void> {
    return apiClient.delete(`/expenses/${expenseId}/`);
  }

  // Bulk operations
  static async bulkPaymentUpdate(bulkData: BulkPaymentUpdate): Promise<void> {
    return apiClient.post('/expenses/bulk-payment-update/', bulkData);
  }

  // Statistics and analytics
  static async getStatistics(): Promise<ExpenseStatistics> {
    return apiClient.get<ExpenseStatistics>('/expenses/statistics/');
  }

  static async getOverdueExpenses(): Promise<Expense[]> {
    return apiClient.get<Expense[]>('/expenses/overdue/');
  }

  static async getUpcomingExpenses(days = 30): Promise<Expense[]> {
    return apiClient.get<Expense[]>(`/expenses/upcoming/?days=${days}`);
  }

  static async getExpenseSummary(): Promise<any> {
    return apiClient.get('/expenses/summary/');
  }

  // Budget Category operations
  static async getBudgetCategories(): Promise<BudgetCategory[]> {
    return apiClient.get<BudgetCategory[]>('/expenses/budget-categories/');
  }

  static async createBudgetCategory(categoryData: Omit<BudgetCategory, 'id' | 'spent_amount' | 'remaining_amount'>): Promise<BudgetCategory> {
    return apiClient.post<BudgetCategory>('/expenses/budget-categories/', categoryData);
  }

  static async getBudgetCategory(categoryId: number): Promise<BudgetCategory> {
    return apiClient.get<BudgetCategory>(`/expenses/budget-categories/${categoryId}/`);
  }

  static async updateBudgetCategory(categoryId: number, categoryData: Partial<BudgetCategory>): Promise<BudgetCategory> {
    return apiClient.patch<BudgetCategory>(`/expenses/budget-categories/${categoryId}/`, categoryData);
  }

  static async deleteBudgetCategory(categoryId: number): Promise<void> {
    return apiClient.delete(`/expenses/budget-categories/${categoryId}/`);
  }

  // Expense Status operations
  static async getExpenseStatuses(): Promise<ExpenseStatus[]> {
    return apiClient.get<ExpenseStatus[]>('/expenses/expense-status/');
  }

  static async createExpenseStatus(statusData: Omit<ExpenseStatus, 'id'>): Promise<ExpenseStatus> {
    return apiClient.post<ExpenseStatus>('/expenses/expense-status/', statusData);
  }

  static async updateExpenseStatus(statusId: number, statusData: Partial<ExpenseStatus>): Promise<ExpenseStatus> {
    return apiClient.patch<ExpenseStatus>(`/expenses/expense-status/${statusId}/`, statusData);
  }

  static async deleteExpenseStatus(statusId: number): Promise<void> {
    return apiClient.delete(`/expenses/expense-status/${statusId}/`);
  }

  // Search and filter operations
  static async searchExpenses(query: string): Promise<PaginatedResponse<Expense>> {
    return apiClient.get<PaginatedResponse<Expense>>(`/expenses/?search=${query}`);
  }

  static async filterExpensesByCategory(categoryId: number): Promise<PaginatedResponse<Expense>> {
    return apiClient.get<PaginatedResponse<Expense>>(`/expenses/?budget_category=${categoryId}`);
  }

  static async filterExpensesByStatus(statusId: number): Promise<PaginatedResponse<Expense>> {
    return apiClient.get<PaginatedResponse<Expense>>(`/expenses/?status=${statusId}`);
  }

  static async filterExpensesByPaymentStatus(isPaid: boolean): Promise<PaginatedResponse<Expense>> {
    return apiClient.get<PaginatedResponse<Expense>>(`/expenses/?is_paid=${isPaid}`);
  }

  static async filterExpensesByDateRange(startDate: string, endDate: string): Promise<PaginatedResponse<Expense>> {
    return apiClient.get<PaginatedResponse<Expense>>(`/expenses/?start_date=${startDate}&end_date=${endDate}`);
  }

  static async filterExpensesByVendor(vendorId: number): Promise<PaginatedResponse<Expense>> {
    return apiClient.get<PaginatedResponse<Expense>>(`/expenses/?vendor=${vendorId}`);
  }

  // ViewSet operations for advanced usage
  static async getAllExpenses(): Promise<Expense[]> {
    return apiClient.get<Expense[]>('/expenses/expenses/');
  }

  static async getAllBudgetCategories(): Promise<BudgetCategory[]> {
    return apiClient.get<BudgetCategory[]>('/expenses/budget-categories/');
  }

  static async getAllExpenseStatuses(): Promise<ExpenseStatus[]> {
    return apiClient.get<ExpenseStatus[]>('/expenses/expense-status/');
  }

  // Payment operations
  static async markAsPaid(expenseId: number, paidAmount: number, paidDate?: string): Promise<Expense> {
    return apiClient.patch<Expense>(`/expenses/${expenseId}/`, {
      paid_amount: paidAmount,
      ...(paidDate && { expense_date: paidDate })
    });
  }

  static async markAsUnpaid(expenseId: number): Promise<Expense> {
    return apiClient.patch<Expense>(`/expenses/${expenseId}/`, {
      paid_amount: 0
    });
  }
}

export default ExpenseService;
