import { format, parseISO } from 'date-fns';
import clsx from 'clsx';

// Date formatting utilities
export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  const start = formatDate(startDate, 'MMM dd');
  const end = formatDate(endDate, 'MMM dd, yyyy');
  return `${start} - ${end}`;
};

// Currency formatting
export const formatCurrency = (amount, currency = 'EUR') => {
  if (typeof amount !== 'number') return '€0';
  
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Status badge utilities
export const getStatusConfig = (status) => {
  const configs = {
    // Enrollment statuses
    'confirmed': {
      label: 'Confirmed',
      className: 'badge-success',
      bgColor: 'bg-secondary-100',
      textColor: 'text-secondary-800'
    },
    'pending_documents': {
      label: 'Pending Documents',
      className: 'badge-warning',
      bgColor: 'bg-accent-100',
      textColor: 'text-accent-800'
    },
    'draft': {
      label: 'Draft',
      className: 'badge-info',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    },
    'cancelled': {
      label: 'Cancelled',
      className: 'badge-error',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    },
    
    // Payment statuses
    'paid_in_full': {
      label: 'Paid in Full',
      className: 'badge-success',
      bgColor: 'bg-secondary-100',
      textColor: 'text-secondary-800'
    },
    'deposit_paid': {
      label: 'Deposit Paid',
      className: 'badge-info',
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-800'
    },
    'pending': {
      label: 'Payment Pending',
      className: 'badge-warning',
      bgColor: 'bg-accent-100',
      textColor: 'text-accent-800'
    },
    'not_started': {
      label: 'Not Started',
      className: 'badge-info',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    },
    
    // Availability statuses
    'available': {
      label: 'Available',
      className: 'badge-success',
      bgColor: 'bg-secondary-100',
      textColor: 'text-secondary-800'
    },
    'limited': {
      label: 'Limited Spaces',
      className: 'badge-warning',
      bgColor: 'bg-accent-100',
      textColor: 'text-accent-800'
    },
    'full': {
      label: 'Full',
      className: 'badge-error',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    }
  };
  
  return configs[status] || {
    label: status,
    className: 'badge-info',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800'
  };
};

// Calculate duration in weeks
export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.ceil(diffDays / 7);
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  // Basic phone validation - accepts various international formats
  const re = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return re.test(phone.replace(/\s/g, ''));
};

// Text utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

// URL utilities
export const generateEnrollmentUrl = (enrollmentId) => {
  return `/enrollments/${enrollmentId}`;
};

export const generateProgramUrl = (programId) => {
  return `/programs/${programId}`;
};

// Class name utility (re-export clsx for consistency)
export const cn = clsx;

// Progress calculation
export const calculateProgress = (currentStep, totalSteps) => {
  return Math.round((currentStep / totalSteps) * 100);
};

// Local storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}; 