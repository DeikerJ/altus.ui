// src/services/httpClient.js
import axios from 'axios';

const base = import.meta.env.VITE_API_BASE || 'https://altus-api-production.up.railway.app/api/v1';

const httpClient = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  return config;
}, (err) => Promise.reject(err));

export default httpClient;
