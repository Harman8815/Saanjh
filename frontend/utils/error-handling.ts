import { ApiError } from '../types/api';

// Error handling utilities
export class ApiErrorHelper {
  // Extract error message from API response
  static extractErrorMessage(error: any): string {
    if (error?.response?.data) {
      const data = error.response.data;
      
      // Handle DRF validation errors
      if (typeof data === 'object' && data !== null) {
        // Check for non-field errors
        if (data.non_field_errors) {
          return Array.isArray(data.non_field_errors) 
            ? data.non_field_errors.join(', ') 
            : data.non_field_errors;
        }
        
        // Check for detail field
        if (data.detail) {
          return data.detail;
        }
        
        // Check for message field
        if (data.message) {
          return data.message;
        }
        
        // Handle field-specific errors
        const fieldErrors = Object.entries(data)
          .filter(([key]) => key !== 'non_field_errors' && key !== 'detail' && key !== 'message')
          .map(([field, errors]) => {
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
            const errorMessages = Array.isArray(errors) ? errors.join(', ') : errors;
            return `${fieldName}: ${errorMessages}`;
          });
        
        if (fieldErrors.length > 0) {
          return fieldErrors.join('; ');
        }
      }
      
      // Handle string errors
      if (typeof data === 'string') {
        return data;
      }
    }
    
    // Handle network errors
    if (error?.code === 'NETWORK_ERROR') {
      return 'Network error. Please check your internet connection.';
    }
    
    // Handle timeout errors
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    // Handle HTTP status errors
    if (error?.response?.status) {
      const status = error.response.status;
      switch (status) {
        case 400:
          return 'Bad request. Please check your input.';
        case 401:
          return 'Unauthorized. Please log in again.';
        case 403:
          return 'Forbidden. You do not have permission to perform this action.';
        case 404:
          return 'Not found. The requested resource does not exist.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        case 502:
          return 'Server is temporarily unavailable. Please try again later.';
        case 503:
          return 'Service unavailable. Please try again later.';
        default:
          return `Request failed with status ${status}.`;
      }
    }
    
    // Fallback error message
    return error?.message || 'An unexpected error occurred. Please try again.';
  }

  // Check if error is a network error
  static isNetworkError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' || 
           error?.message?.includes('Network Error') ||
           !navigator.onLine;
  }

  // Check if error is a timeout error
  static isTimeoutError(error: any): boolean {
    return error?.code === 'ECONNABORTED' || 
           error?.message?.includes('timeout');
  }

  // Check if error is an authentication error
  static isAuthError(error: any): boolean {
    return error?.response?.status === 401;
  }

  // Check if error is a validation error
  static isValidationError(error: any): boolean {
    return error?.response?.status === 400 && 
           typeof error?.response?.data === 'object' &&
           error?.response?.data !== null;
  }

  // Get field-specific errors
  static getFieldErrors(error: any): Record<string, string[]> {
    if (!this.isValidationError(error)) {
      return {};
    }
    
    const data = error.response.data;
    const fieldErrors: Record<string, string[]> = {};
    
    Object.entries(data).forEach(([field, errors]) => {
      if (field !== 'non_field_errors' && field !== 'detail' && field !== 'message') {
        fieldErrors[field] = Array.isArray(errors) ? errors : [errors];
      }
    });
    
    return fieldErrors;
  }

  // Get non-field errors
  static getNonFieldErrors(error: any): string[] {
    if (!this.isValidationError(error)) {
      return [];
    }
    
    const data = error.response.data;
    
    if (data.non_field_errors) {
      return Array.isArray(data.non_field_errors) ? data.non_field_errors : [data.non_field_errors];
    }
    
    if (data.detail) {
      return [data.detail];
    }
    
    if (data.message) {
      return [data.message];
    }
    
    return [];
  }
}

// Toast notification helper for errors
export function showErrorToast(message: string) {
  // This would integrate with your toast notification library
  console.error('Error:', message);
  
  // For now, we'll use a simple alert (replace with your toast library)
  if (typeof window !== 'undefined') {
    // You can replace this with your preferred toast library
    // Example: toast.error(message);
    alert(message);
  }
}

// Success toast helper
export function showSuccessToast(message: string) {
  console.log('Success:', message);
  
  if (typeof window !== 'undefined') {
    // You can replace this with your preferred toast library
    // Example: toast.success(message);
    alert(message);
  }
}
