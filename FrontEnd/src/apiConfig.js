import axios from 'axios';

/**
 * Automatically resolves the backend API Base URL:
 * - Local development (localhost, 127.0.0.1, LAN IPs) -> http://localhost:8000/api
 * - Deployed / Production environment (Render, Vercel, etc.) -> https://huma-hr.onrender.com/api
 * - Override via VITE_API_BASE_URL if specified in .env
 */
const resolveApiBaseUrl = () => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local') ||
      /^192\.168\.\d+\.\d+$/.test(hostname) ||
      /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname);

    if (isLocal) {
      return 'http://localhost:8000/api';
    }
  }

  return 'https://huma-hr.onrender.com/api';
};

export const API_BASE_URL = resolveApiBaseUrl();
export const STORAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '/storage');

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
