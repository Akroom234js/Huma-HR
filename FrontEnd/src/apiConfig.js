import axios from 'axios';

// export const API_BASE_URL = "http://127.0.0.1:8000/api";
export const API_BASE_URL = "https://huma-hr.onrender.com/api";

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
