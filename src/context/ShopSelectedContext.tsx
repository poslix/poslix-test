import { createContext } from 'react';

export const ShopSelectedContext = createContext({
  selectedShop: 0,
  setSelectedShop: (selectedShop: any) => {},
});