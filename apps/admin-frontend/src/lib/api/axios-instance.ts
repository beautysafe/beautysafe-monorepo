import axios from 'axios';

export const axiosInstance = axios.create({
  withCredentials: true,
baseURL: import.meta.env.VITE_API_HOST,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
