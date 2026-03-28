import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'https://nymintra-dev-production.up.railway.app/api/v1';

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
            // Handle unauthorized (clear token)
            Cookies.remove('access_token', { path: '/' });
            localStorage.removeItem('user');

            // We NO LONGER automatically redirect to login here.
            // Individual pages (like /orders, /checkout) must handle their own Auth guards
            // or we use Next.js middleware. This prevents infinite redirect loops on public pages.
        }
        return Promise.reject(error);
    }
);
