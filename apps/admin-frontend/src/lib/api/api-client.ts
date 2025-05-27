import { axiosInstance } from './axios-instance';
import { setupRequestInterceptor } from './interceptors/request-interceptor';
import { setupResponseInterceptor } from './interceptors/response-interceptor';

setupRequestInterceptor();
setupResponseInterceptor();

export const api = {
  get: <T = any>(url: string, params?: object) =>
    axiosInstance.get<T>(url, { params }).then((res) => res.data),

  post: <T = any, D = any>(url: string, data: D, params?: object) =>
    axiosInstance.post<T>(url, data, { params }).then((res) => res.data),

  patch: <T = any, D = any>(url: string, data: D, params?: object) =>
    axiosInstance.patch<T>(url, data, { params }).then((res) => res.data),

  put: <T = any, D = any>(url: string, data: D, params?: object) =>
    axiosInstance.put<T>(url, data, { params }).then((res) => res.data),

  delete: <T = any>(url: string, params?: object, headers?: object) =>
    axiosInstance.delete<T>(url, { params, headers }).then((res) => res.data),
};
