import jwtDecode from 'jwt-decode';
import Router from 'next/router';
import { ELocalStorageKeys } from 'src/utils/app-contants';
import { ROUTES } from 'src/utils/app-routes';

export const getToken = () => {
  const ownToken = localStorage.getItem(ELocalStorageKeys.TOKEN);
  if (ownToken != null) return ownToken;
  else return '';
};

export const getUsername = () => {
  const ownToken = localStorage.getItem(ELocalStorageKeys.USER_NAME);
  if (ownToken != null) return ownToken;
  else return 'none';
};

export const isLogin = () => {
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

export const getDecodedToken = () => {
  const token = getToken();
  if (token == '') return null;
  const _token = jwtDecode(token);
  return _token;
};
