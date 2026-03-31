import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.accessToken) {
      localStorage.setItem('clinicore_access_token', response.data.accessToken);
      localStorage.setItem('clinicore_refresh_token', response.data.refreshToken);
      localStorage.setItem('clinicore_user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem('clinicore_access_token');
    localStorage.removeItem('clinicore_refresh_token');
    localStorage.removeItem('clinicore_user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('clinicore_user');
    return user ? JSON.parse(user) : null;
  },

  getAccessToken: () => {
    return localStorage.getItem('clinicore_access_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('clinicore_access_token');
  },
};