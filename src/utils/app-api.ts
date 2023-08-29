import axios from 'axios';
import { getSession } from 'next-auth/react';
import authService from 'src/services/auth.service';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
});
export const _guestApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(api(token));
    }
  });

  failedQueue = [];
};

// TO be refactored
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    const _token = session?.user?.token;
    if (_token) {
      config.headers.Authorization = `Bearer ${_token}`;
    }

    return config;
  },
  (error) => {
    authService.logout();
    return Promise.reject(error);
  }
);

const responseInterceptor = api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const session = await getSession();
          const newToken = await authService.refreshToken();
          isRefreshing = false;

          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          session.user.token = newToken;
          processQueue(null, newToken);
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null);
        }
      }

      const retryOriginalRequest = new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });

      return retryOriginalRequest;
    }

    return Promise.reject(error);
  }
);

export default api;
