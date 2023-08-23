'use client';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import Router from 'next/router';
import api from 'src/utils/app-api';
import { ELocalStorageKeys } from 'src/utils/app-contants';
import { ROUTES } from 'src/utils/app-routes';

interface DecodedToken {
  exp: number;
}
let accessToken: string = '';
class AuthService {
  constructor() {
    if (typeof window !== 'undefined') {
      accessToken = window.localStorage.getItem(ELocalStorageKeys.TOKEN) ?? '';
    }
  }

  private _decodeToken(token: string): DecodedToken | null {
    try {
      const decoded = jwt_decode<DecodedToken>(token);
      return decoded;
    } catch (e) {
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    accessToken = window.localStorage.getItem(ELocalStorageKeys.TOKEN) ?? '';
    if (!this.hasExpired()) return accessToken;

    return await this.refreshToken();
  }

  async getDecodedToken(): Promise<DecodedToken | null> {
    const token = await this.getToken();
    if (!token) return null;
    return this._decodeToken(token);
  }

  private hasExpired(): boolean {
    if (!accessToken) return false;
    const decodedToken = this._decodeToken(accessToken);

    if (!decodedToken) return true;
    const now = moment();
    const expiryDate = moment.unix(decodedToken.exp);

    return expiryDate.isSameOrBefore(now, 'minute');
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  setToken(newAccessToken: string): void {
    if (!newAccessToken) window.localStorage.removeItem(ELocalStorageKeys.TOKEN);
    accessToken = newAccessToken;

    window.localStorage.setItem(ELocalStorageKeys.TOKEN, newAccessToken);
  }

  async refreshToken(): Promise<string | null> {
    try {
      const loginToken = await api
        .post(`/refresh`)
        .then(({ data }) => data.result.authorisation.token);

      this.setToken(loginToken);

      return loginToken;
    } catch (e) {
      this.logout();
      return null;
    }
  }

  logout(): void {
    this.setToken('');
    window.location.href = ROUTES.AUTH;
  }

  getUsername(): string {
    const ownToken = window.localStorage.getItem(ELocalStorageKeys.USER_NAME);
    return ownToken ?? 'none';
  }

  redirectToLogin(url: string = ''): void {
    Router.push(url === '' ? ROUTES.AUTH : url);
  }

  getMyShopId(myQuery: any): number {
    if (typeof myQuery.id !== undefined) return +Number(myQuery.id).toFixed(0);
    return 0;
  }

  getmyUsername(qury: any): string {
    if (typeof qury.username !== undefined) return qury.username;
    return '0';
  }

  getUserData(): any {
    const user = window.localStorage.getItem(ELocalStorageKeys.USER);
    return user != null ? JSON.parse(user) : null;
  }
}

export default Object.freeze(new AuthService());
