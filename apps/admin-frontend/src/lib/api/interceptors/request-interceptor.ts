import { axiosInstance } from '../axios-instance';

export const setupRequestInterceptor = () => {
  axiosInstance.interceptors.request.use(
    (config) => {
      config.headers = config.headers || {};
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};
