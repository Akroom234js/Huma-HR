import axios from 'axios';

export const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? "https://huma-hr.onrender.com/api"
  : "https://huma-hr.onrender.com/api"; 

// export const API_BASE_URL = "https://huma-hr.onrender.com/api";
export const STORAGE_BASE_URL = API_BASE_URL.replace('/api', '/storage');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});


apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
