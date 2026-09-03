import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const isCancel = axios.isCancel;

// Response interceptor for unified error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Preserve cancellation errors untouched so abort handlers work reliably
    if (axios.isCancel(error) || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    const enhancedError = new Error(message);
    (enhancedError as any).response = error.response;
    (enhancedError as any).status = error.response?.status;
    (enhancedError as any).code = error.code;
    return Promise.reject(enhancedError);
  }
);
