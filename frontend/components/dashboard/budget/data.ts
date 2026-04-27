import {
  Building2,
  Utensils,
  Palette,
  Camera,
  Shirt,
  Gem,
  Gift,
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { BudgetCategory, PaymentStatusConfig, PaymentStatus } from './types';

export const paymentStatusConfig: Record<PaymentStatus, PaymentStatusConfig> = {
  pending: { 
    label: 'Pending', 
    icon: Clock, 
    color: 'text-amber-400', 
    bg: 'bg-amber-400/10' 
  },
  partial: { 
    label: 'Partial', 
    icon: AlertCircle, 
    color: 'text-orange-400', 
    bg: 'bg-orange-400/10' 
  },
  paid: { 
    label: 'Paid', 
    icon: CheckCircle2, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-400/10' 
  }
};

// Static data removed - budget categories now loaded from API
export const initialCategories: BudgetCategory[] = [];
export const totalBudget = 0;
