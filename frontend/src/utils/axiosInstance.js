import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8070',
});

// Add a request interceptor to inject token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
