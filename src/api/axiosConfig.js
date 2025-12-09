import axios from 'axios';
import authService from '../services/authService';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add auth token to all requests
api.interceptors.request.use(
    async (config) => {
        // Get valid access token (will auto-refresh if needed)
        const token = await authService.getAccessToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle authentication errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            const errorCode = error.response?.data?.code;

            // Don't retry for these error codes
            if (['TOKEN_BLACKLISTED', 'SESSION_TIMEOUT', 'INVALID_REFRESH_TOKEN'].includes(errorCode)) {
                console.log('Authentication error:', errorCode);
                authService.clearStorage();
                window.location.href = `/login?reason=${errorCode.toLowerCase()}`;
                return Promise.reject(error);
            }

            // Try to refresh the token
            if (errorCode === 'TOKEN_EXPIRED') {
                originalRequest._retry = true;

                try {
                    const newToken = await authService.refreshAccessToken();

                    if (newToken) {
                        // Retry the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    authService.clearStorage();
                    window.location.href = '/login?reason=session_expired';
                    return Promise.reject(refreshError);
                }
            }
        }

        // For other errors, show user-friendly message
        if (error.response?.status === 403) {
            console.error('Access forbidden:', error.response.data);
        } else if (error.response?.status === 429) {
            console.error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
            console.error('Server error. Please try again later.');
        }

        return Promise.reject(error);
    }
);

export default api;
