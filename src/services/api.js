import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

console.log('🔗 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clinicore_access_token');
    console.log('📤 Request:', config.url, 'Token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 and refresh token
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('🔄 Refreshing token...');
      
      const refreshToken = localStorage.getItem('clinicore_refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          console.log('✅ Token refreshed');
          localStorage.setItem('clinicore_access_token', response.data.accessToken);
          localStorage.setItem('clinicore_refresh_token', response.data.refreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed');
          localStorage.removeItem('clinicore_access_token');
          localStorage.removeItem('clinicore_refresh_token');
          localStorage.removeItem('clinicore_user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;