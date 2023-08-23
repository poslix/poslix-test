'use client';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import Router from 'next/router';
import api from 'src/utils/app-api';
import { ELocalStorageKeys } from 'src/utils/app-contants';
import { ROUTES } from 'src/utils/app-routes';

let accessToken = '';

/**
 * OLD METHOD : token holds all data
 * NEW METHOD : token holds only token
 *            : user holds all data
 *
 */

function _decodeToken(token: string) {
  try {
    const decoded = jwt_decode(token);
    return decoded;
  } catch (e) {
    return null;
  }
}
// -------------------------------

export async function getToken() {
  accessToken = localStorage.getItem(ELocalStorageKeys.TOKEN) ?? '';
  if (!hasExpired()) return accessToken; // will return null if not existed

  return await refreshToken();
}

export async function getDecodedToken() {
  const token = await getToken();
  if (!token) return null;
  return _decodeToken(token);
}

export function hasExpired() {
  if (!accessToken) return false; // invalid or missing is not "expired"
  const decodedToken = jwt_decode(accessToken) as any;

  const now = moment();
  const expiryDate = moment.unix(decodedToken.exp);

  return expiryDate.isSameOrBefore(now, 'minute');
}

export async function isLoggedIn() {
  const token = await getToken();
  return !!token;
}

export function setToken({ newAccessToken }): void {
  if (!newAccessToken) localStorage.removeItem(ELocalStorageKeys.TOKEN);
  accessToken = newAccessToken;

  localStorage.setItem(ELocalStorageKeys.TOKEN, newAccessToken);
}

export async function refreshToken(): Promise<string | null> {
  try {
    const loginToken = await api
      .post(`/refresh`)
      .then(({ data }) => data.result.authorisation.token);

    setToken({ newAccessToken: loginToken });

    return loginToken;
    // return loginData.accessToken;
  } catch (e) {
    logout();
    return null;
  }
}

export function logout(): void {
  setToken({ newAccessToken: '' });
  window.location.href = ROUTES.AUTH;
}

export const getUsername = () => {
  const ownToken = localStorage.getItem(ELocalStorageKeys.USER_NAME);
  if (ownToken != null) return ownToken;
  else return 'none';
};

export const isLogin = () => {
  // legacy
  const ownToken = localStorage.getItem(ELocalStorageKeys.TOKEN);
  if (ownToken == null) return false;

  return true;
};

export const redirectToLogin = (url = '') => {
  Router.push(url == '' ? ROUTES.AUTH : url);
};

export const getMyShopId = (myQuery: any) => {
  if (typeof myQuery.id != undefined) return +Number(myQuery.id).toFixed(0);
  return 0;
};

export const getmyUsername = (qury: any): string => {
  if (typeof qury.username != undefined) return qury.username;
  return '0';
};

export const getUserData = () => {
  const user = localStorage.getItem(ELocalStorageKeys.USER);
  if (user == null) return null;
  return JSON.parse(user);
};
