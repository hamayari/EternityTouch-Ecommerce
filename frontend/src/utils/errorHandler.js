/**
 * Utility to handle errors and provide user-friendly messages
 */

export const getErrorMessage = (error) => {
  // Network errors
  if (!error.response) {
    if (error.request) {
      return 'Network error. Please check your internet connection and try again.';
    }
    return 'An unexpected error occurred. Please try again.';
  }

  // Server errors
  const status = error.response.status;
  const message = error.response.data?.message;

  // Custom error messages based on status code
  switch (status) {
    case 400:
      return message || 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Your session has expired. Please login again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return message || 'The requested resource was not found.';
    case 409:
      return message || 'This action conflicts with existing data.';
    case 422:
      return message || 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Our team has been notified. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again in a few minutes.';
    default:
      return message || 'Something went wrong. Please try again.';
  }
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error, toast, customMessage = null) => {
  const message = customMessage || getErrorMessage(error);
  
  // Log error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error('API Error:', error);
  }
  
  // Show user-friendly message
  if (toast) {
    toast.error(message);
  }
  
  return message;
};

/**
 * Validate form fields
 */
export const validateField = (name, value, rules = {}) => {
  const errors = [];

  // Required validation
  if (rules.required && !value) {
    errors.push(`${name} is required`);
  }

  // Email validation
  if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errors.push('Invalid email format');
  }

  // Phone validation
  if (rules.phone && value && !/^\d{10,15}$/.test(value)) {
    errors.push('Phone must be 10-15 digits');
  }

  // Min length validation
  if (rules.minLength && value && value.length < rules.minLength) {
    errors.push(`${name} must be at least ${rules.minLength} characters`);
  }

  // Max length validation
  if (rules.maxLength && value && value.length > rules.maxLength) {
    errors.push(`${name} must not exceed ${rules.maxLength} characters`);
  }

  // Pattern validation
  if (rules.pattern && value && !rules.pattern.test(value)) {
    errors.push(rules.patternMessage || `Invalid ${name} format`);
  }

  return errors;
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return fallback;
  }
};

/**
 * Retry failed requests
 */
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};
