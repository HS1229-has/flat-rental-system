import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Some endpoints need X-User-Id, we can get it from localStorage
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.id) {
        config.headers['X-User-Id'] = user.id;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if token is expired/invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to split image URLs using | as new delimiter and keeping backward compatibility with ,
export const splitImageUrls = (str) => {
  if (!str) return [];

  const API_BASE = 'http://localhost:8080';

  // Helper to resolve relative URLs
  const resolve = (url) => {
    const trimmed = url.trim();
    if (!trimmed) return null;
    // Convert relative /api/... paths to absolute
    if (trimmed.startsWith('/api/')) return API_BASE + trimmed;
    return trimmed;
  };

  // If string contains '|', split by '|'
  if (str.includes('|')) {
    return str.split('|').map(resolve).filter(Boolean);
  }
  // If it's a single base64 data URL, it contains a comma but no '|'
  if (str.startsWith('data:image')) {
    return [str];
  }
  // If it's a relative API URL
  if (str.startsWith('/api/')) {
    return [resolve(str)];
  }
  // Fallback to splitting by comma for legacy seeded HTTP URLs
  return str.split(',').map(resolve).filter(Boolean);
};

export default api;
