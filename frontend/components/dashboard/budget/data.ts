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

export const initialCategories: BudgetCategory[] = [
  {
    id: 'venue',
    name: 'Venue',
    icon: Building2,
    allocated: 500000,
    color: '#8B1538',
    expenses: [
      { id: '1', vendorName: 'Taj Palace Banquet Hall', amount: 500000, paidAmount: 250000, status: 'partial', date: '2024-03-15', notes: '50% advance paid' }
    ]
  },
  {
    id: 'catering',
    name: 'Catering',
    icon: Utensils,
    allocated: 300000,
    color: '#D4A853',
    expenses: [
      { id: '2', vendorName: 'Bikanervala Catering', amount: 300000, paidAmount: 100000, status: 'partial', date: '2024-03-20' }
    ]
  },
  {
    id: 'decoration',
    name: 'Decoration',
    icon: Palette,
    allocated: 150000,
    color: '#E8B4B8',
    expenses: [
      { id: '3', vendorName: 'Ferns N Petals', amount: 80000, paidAmount: 40000, status: 'partial', date: '2024-03-25' }
    ]
  },
  {
    id: 'photography',
    name: 'Photography',
    icon: Camera,
    allocated: 100000,
    color: '#4A6741',
    expenses: [
      { id: '4', vendorName: 'Wedding Shots', amount: 100000, paidAmount: 50000, status: 'partial', date: '2024-03-18' }
    ]
  },
  {
    id: 'attire',
    name: 'Attire',
    icon: Shirt,
    allocated: 200000,
    color: '#9B59B6',
    expenses: [
      { id: '5', vendorName: 'Sabyasachi Mumbai', amount: 150000, paidAmount: 75000, status: 'partial', date: '2024-03-10', notes: 'Bridal lehenga' }
    ]
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    icon: Gem,
    allocated: 300000,
    color: '#C9A227',
    expenses: [
      { id: '6', vendorName: 'Tanishq', amount: 200000, paidAmount: 200000, status: 'paid', date: '2024-03-05' }
    ]
  },
  {
    id: 'gifts',
    name: 'Gifts & Favors',
    icon: Gift,
    allocated: 50000,
    color: '#E74C3C',
    expenses: []
  },
  {
    id: 'misc',
    name: 'Miscellaneous',
    icon: MoreHorizontal,
    allocated: 100000,
    color: '#7F8C8D',
    expenses: []
  }
];

export const totalBudget = 1700000;
