import { toast } from 'react-toastify';

/**
 * Toast utility for consistent notifications across the app
 */

const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, { ...defaultOptions, ...options });
  },
  
  error: (message, options = {}) => {
    toast.error(message, { ...defaultOptions, ...options });
  },
  
  info: (message, options = {}) => {
    toast.info(message, { ...defaultOptions, ...options });
  },
  
  warning: (message, options = {}) => {
    toast.warning(message, { ...defaultOptions, ...options });
  },
  
  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        pending: messages.pending || 'Processing...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong'
      },
      { ...defaultOptions, ...options }
    );
  }
};
