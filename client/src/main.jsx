import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

// Set the base URL for all axios requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Only log in development mode
const isDevelopment = import.meta.env.MODE === 'development';

// Add request interceptor with logging only in development mode with a DEBUG flag
axios.interceptors.request.use(
  (config) => {
    // Don't log anything in production
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor with logging only in development mode with a DEBUG flag
axios.interceptors.response.use(
  (response) => {
    // Don't log anything in production
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
