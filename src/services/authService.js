import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (email, password) => {
    // Step 1: Get tokens
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;

    const accessToken  = data.accessToken  || data.access_token  || data.token;
    const refreshToken = data.refreshToken || data.refresh_token || '';

    if (accessToken) {
      localStorage.setItem('clinicore_access_token',  accessToken);
      localStorage.setItem('clinicore_refresh_token', refreshToken);

      // Step 2: Fetch full user profile (role, name, etc.)
      try {
        const userResponse = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const user = userResponse.data?.user || userResponse.data;
        localStorage.setItem('clinicore_user', JSON.stringify(user));

        // Step 3: Notify AppLayout to re-read localStorage and update sidebar
        window.dispatchEvent(new Event('clinicore_user_saved'));

        console.log('[authService] User saved:', user?.full_name, '| Role:', user?.role);
      } catch (err) {
        console.warn('[authService] Could not fetch user profile:', err.message);
        localStorage.setItem('clinicore_user', 'null');
      }
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem('clinicore_access_token');
    localStorage.removeItem('clinicore_refresh_token');
    localStorage.removeItem('clinicore_user');
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('clinicore_user');
      if (!user || user === 'null' || user === 'undefined') return null;
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  getAccessToken: () => localStorage.getItem('clinicore_access_token'),

  isAuthenticated: () => !!localStorage.getItem('clinicore_access_token'),
};