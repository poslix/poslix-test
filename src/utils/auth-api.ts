import axios, { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { ROUTES } from './app-routes';
import { JWT } from 'next-auth/jwt';

async function refreshAccessToken(token: string) {
  const { data } = await axios.post<string, any, any>(
    `${process.env.NEXT_PUBLIC_API_BASE}refresh`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data.result;
}

export const authApi = async (session: Session): Promise<AxiosInstance> => {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE,
    headers: {
      Authorization: `Bearer ${session.user.token}`,
    },
  });

  // Attach a request interceptor to automatically refresh the token
  api.interceptors.request.use(async (config) => {
    const now = Math.floor(Date.now() / 1000);

    const _token = jwtDecode<JWT>(session.user.token);

    const exp = _token.exp || 0;
    const timeUntilExpiry = exp - now;

    // Refresh token if it's about to expire (within 60 seconds)
    if (timeUntilExpiry < 60) {
      try {
        const newToken = await refreshAccessToken(session.user.token);
        config.headers['Authorization'] = `Bearer ${newToken}`;
        session.user.token = newToken;
      } catch (error) {
        // Handle token refresh error (e.g., redirect to login)
        console.error('Token refresh failed:', error);
        signOut();
        window.location.href = ROUTES.AUTH;
        // You might want to redirect the user to the login page here
        // or log them out, depending on your application's strategy.
        throw error;
      }
    }

    return config;
  });

  return api;
};
