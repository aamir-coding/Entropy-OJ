import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const isCancel = axios.isCancel;

type UnauthorizedCallback = () => void;
let onUnauthorizedCallback: UnauthorizedCallback | null = null;

export const setOnUnauthorizedCallback = (cb: UnauthorizedCallback | null) => {
  onUnauthorizedCallback = cb;
};

// Response interceptor for unified error extraction & session expiry detection (Issue H-3)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Preserve cancellation errors untouched so abort handlers work reliably
    if (axios.isCancel(error) || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = error.config?.url || '';

    // Handle 401 unauthorized: notify AuthContext to clear state and prompt login
    if (
      status === 401 &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/register') &&
      !url.includes('/auth/me')
    ) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
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
