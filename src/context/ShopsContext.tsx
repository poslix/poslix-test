import { createContext } from 'react';

export const ShopsContext = createContext({
  userShops: [],
  setUserShops: (userShops: any) => {},
});