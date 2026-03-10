import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercept requests to add JWT token if available
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercept responses for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (e.g., clear token and redirect to login)
            Cookies.remove('access_token');
            if (typeof window !== 'undefined') {
                const path = window.location.pathname;
                if (path.startsWith('/admin') && path !== '/admin') {
                    // Redirect to admin login (which is at /admin)
                    window.location.href = '/admin';
                } else if (!path.includes('/login') && !path.startsWith('/admin')) {
                    // Redirect regular users to login
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);
