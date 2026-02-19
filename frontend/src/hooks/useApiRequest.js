import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/errorHandler';

/**
 * Custom hook for API requests with error handling and retry logic
 */
const useApiRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Execute API request with automatic retry
   */
  const execute = useCallback(async (
    requestFn,
    options = {}
  ) => {
    const {
      maxRetries = 2,
      retryDelay = 1000,
      showToast = true,
      onSuccess,
      onError
    } = options;

    setLoading(true);
    setError(null);

    let lastError = null;

    // Retry logic
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await requestFn();
        
        setData(response.data);
        setLoading(false);
        
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        return response.data;
      } catch (err) {
        lastError = err;
        
        // Don't retry on client errors (4xx)
        if (err.response && err.response.status >= 400 && err.response.status < 500) {
          break;
        }
        
        // Wait before retrying (except on last attempt)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    // All retries failed
    const errorMessage = handleApiError(lastError, showToast ? toast : null);
    setError(errorMessage);
    setLoading(false);
    
    if (onError) {
      onError(lastError);
    }
    
    throw lastError;
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset
  };
};

/**
 * Hook for fetching data with automatic loading and error states
 */
export const useFetch = (url, options = {}) => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.get(url, options);
      setState({
        loading: false,
        error: null,
        data: response.data
      });
    } catch (error) {
      const errorMessage = handleApiError(error, toast);
      setState({
        loading: false,
        error: errorMessage,
        data: null
      });
    }
  }, [url]);

  return {
    ...state,
    refetch: fetchData
  };
};

/**
 * Hook for checking network status
 * ✅ Fixed: Properly uses useEffect with cleanup
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('No internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useApiRequest;
