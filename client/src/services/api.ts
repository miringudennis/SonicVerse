import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If the env variable accidentally contains the key (e.g. "VITE_API_URL=http..."), strip it
  if (envUrl && envUrl.includes('VITE_API_URL=')) {
    return envUrl.split('VITE_API_URL=')[1];
  }
  
  return envUrl || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

console.log('Zynk API Base URL:', api.defaults.baseURL);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
