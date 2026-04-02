import { api } from '../lib/api';
import Cookies from 'js-cookie';

export const authService = {
    async register(data: any) {
        const response = await api.post('/auth/register', data);
        if (response.data.access_token) {
            Cookies.set('access_token', response.data.access_token, { expires: 7, path: '/' });
        }
        return response.data;
    },

    async login(data: any) {
        // OAuth2PasswordRequestForm expects URLSearchParams
        const formData = new URLSearchParams();
        formData.append('username', data.email);
        formData.append('password', data.password);

        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.access_token) {
            Cookies.set('access_token', response.data.access_token, { expires: 7, path: '/' });
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    },

    async adminLogin(data: any) {
        // OAuth2PasswordRequestForm expects URLSearchParams
        const formData = new URLSearchParams();
        formData.append('username', data.email); // FastApi form uses username field for email
        formData.append('password', data.password);

        const response = await api.post('/auth/admin-login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.access_token) {
            // Can use same token name, the backend decodes the role automatically
            Cookies.set('access_token', response.data.access_token, { expires: 7, path: '/' });
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    },

    logout() {
        Cookies.remove('access_token', { path: '/' });
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    async getCurrentUser() {
        const response = await api.get('/users/me');
        return response.data;
    },

    async forgotPassword(email: string) {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    async resetPassword(password: string) {
        const response = await api.post('/auth/reset-password', { new_password: password });
        return response.data;
    }
};
