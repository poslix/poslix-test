export enum ELocalStorageKeys {
  TOKEN = 'userinfo',
  TOKEN_COOKIE = 'tokend',
  USER = 'userdata',
  USER_NAME = 'username',
  USER_LOCATIONS = 'userlocs',
  CUSTOEMR_LOCATIONS = 'cusLocs',
  FULL_NAME = 'userfullname',
  LEVELS = 'levels',
}

export function getLocalStorage<T>(key: ELocalStorageKeys): T | null {
  if (typeof window === 'undefined' || !localStorage) {
    return null;
  }

  const _val = localStorage.getItem(key);

  if (_val === null || _val === 'undefined' || _val === 'null' || _val === '') {
    return null;
  }

  const val = JSON.parse(_val) as T;
  return val;
}
