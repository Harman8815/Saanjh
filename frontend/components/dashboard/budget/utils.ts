import { formatCurrency as formatCurrencyUtil, formatCurrencyShort } from '../../../utils/currency';

export const formatCurrency = (amount: number): string => {
  return formatCurrencyUtil(amount);
};

export const formatShortCurrency = (amount: number): string => {
  return formatCurrencyShort(amount);
};

export const getCardStyle = () => ({
  background: 'linear-gradient(135deg, rgba(30, 30, 35, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(245, 245, 240, 0.08)',
  borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
} as React.CSSProperties);

export const getCardHoverStyle = () => ({
  background: 'linear-gradient(135deg, rgba(40, 40, 45, 0.7) 0%, rgba(30, 30, 35, 0.5) 100%)',
  border: '1px solid rgba(212, 165, 116, 0.15)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(212, 165, 116, 0.05)'
} as React.CSSProperties);

export const getCardLeaveStyle = () => ({
  background: 'linear-gradient(135deg, rgba(30, 30, 35, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%)',
  border: '1px solid rgba(245, 245, 240, 0.08)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
} as React.CSSProperties);

export const getProgressBarStyle = (isOverBudget: boolean) => ({
  width: '100%',
  height: '100%',
  borderRadius: '9999px',
  background: isOverBudget
    ? 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)'
    : 'linear-gradient(90deg, rgba(212, 165, 116, 0.3) 0%, rgba(201, 169, 126, 0.3) 100%)'
} as React.CSSProperties);

export const getMainProgressStyle = (isOverBudget: boolean) => ({
  width: '100%',
  height: '100%',
  borderRadius: '9999px',
  background: isOverBudget
    ? 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)'
    : 'linear-gradient(90deg, #d4a574 0%, #c9a97e 100%)'
} as React.CSSProperties);
