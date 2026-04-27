'use client';

import useSWR from 'swr';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExpenseService } from '../services';
import { Expense, ExpenseStatistics, BulkPaymentUpdate, PaginatedResponse } from '../types/api';

// Fetch expenses with pagination
export function useExpenses(page = 1, pageSize = 20) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Expense>>(
    `expenses?page=${page}&page_size=${pageSize}`,
    () => ExpenseService.getExpenses(page, pageSize),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    expenses: data?.results || [],
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

// Fetch expense statistics
export function useExpenseStatistics() {
  const { data, error, isLoading, mutate } = useSWR<ExpenseStatistics>(
    'expense-statistics',
    () => ExpenseService.getStatistics(),
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

// Fetch overdue expenses
export function useOverdueExpenses() {
  const { data, error, isLoading, mutate } = useSWR<Expense[]>(
    'overdue-expenses',
    () => ExpenseService.getOverdueExpenses(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    expenses: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Fetch upcoming expenses
export function useUpcomingExpenses(days = 30) {
  const { data, error, isLoading, mutate } = useSWR<Expense[]>(
    `upcoming-expenses-${days}`,
    () => ExpenseService.getUpcomingExpenses(days),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    expenses: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Fetch expense summary
export function useExpenseSummary() {
  const { data, error, isLoading, mutate } = useSWR(
    'expense-summary',
    () => ExpenseService.getExpenseSummary(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    summary: data,
    isLoading,
    error,
    mutate,
  };
}

// Search expenses
export function useSearchExpenses(query: string) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Expense>>(
    query ? `search-expenses-${query}` : null,
    () => ExpenseService.searchExpenses(query),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    expenses: data?.results || [],
    isLoading,
    error,
    mutate,
  };
}

// Filter expenses by category
export function useFilterExpensesByCategory(categoryId: number) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Expense>>(
    categoryId ? `expenses-filter-category-${categoryId}` : null,
    () => ExpenseService.filterExpensesByCategory(categoryId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    expenses: data?.results || [],
    isLoading,
    error,
    mutate,
  };
}

// Filter expenses by payment status
export function useFilterExpensesByPaymentStatus(paid: boolean) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Expense>>(
    `expenses-filter-payment-${paid}`,
    () => ExpenseService.filterExpensesByPaymentStatus(paid),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    expenses: data?.results || [],
    isLoading,
    error,
    mutate,
  };
}

// Create expense mutation
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation<Expense, Error, Omit<Expense, 'id' | 'created_at' | 'updated_at'>>({
    mutationFn: (expenseData) => ExpenseService.createExpense(expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
    },
  });
}

// Update expense mutation
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation<Expense, Error, { expenseId: number; expenseData: Partial<Expense> }>({
    mutationFn: ({ expenseId, expenseData }) => ExpenseService.updateExpense(expenseId, expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
    },
  });
}

// Delete expense mutation
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (expenseId) => ExpenseService.deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
    },
  });
}

// Bulk payment update mutation
export function useBulkPaymentUpdate() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, BulkPaymentUpdate>({
    mutationFn: (bulkData) => ExpenseService.bulkPaymentUpdate(bulkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
    },
  });
}
