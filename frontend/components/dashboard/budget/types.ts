import { ReactNode, ComponentType } from 'react';
import { LucideProps } from 'lucide-react';

export type PaymentStatus = 'pending' | 'partial' | 'paid';
export type TabType = 'budget' | 'demographics' | 'history';
export type SortField = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

export interface Expense {
  id: string;
  vendorName: string;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  date: string;
  notes?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: ComponentType<LucideProps>;
  allocated: number;
  expenses: Expense[];
  color: string;
}

export interface PaymentStatusConfig {
  label: string;
  icon: ComponentType<LucideProps>;
  color: string;
  bg: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  allocated: number;
}

export interface ExpenseWithCategory extends Expense {
  category: string;
  categoryColor: string;
}

export interface DateRange {
  from: string;
  to: string;
}
