import axios from 'axios';

// In production, VITE_API_URL points to the Railway backend.
// In dev, Vite's proxy forwards /api → localhost:3000 so baseURL = '' works.
const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// On 401, clear user data and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ttm_user');
      // Avoid redirect loop on the login page itself
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
