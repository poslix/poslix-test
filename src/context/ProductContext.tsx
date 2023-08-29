import { ITax } from '@models/pos.types';
import { createContext, useContext } from 'react';
export const ProductContext = createContext({
  products: [],
  setProducts: (products: any) => {},
  cats: [],
  setCats: (cats: any) => {},
  brands: [],
  setBrands: (cats: any) => {},
  customers: [],
  setCustomers: (customers: any) => {},
  taxes: [] as ITax[],
  setTaxes: (taxes: any) => {},
  taxGroups: [],
  setTaxGroups: (taxGroups: any) => {},
  variations: { variations: [], variations_multi: [] },
  setVariations: (variations: any) => {},
  packageItems: [],
  setPackageItems: (packageItems: any) => {},
});

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductsContext must be used within a ProductsContextProvider');
  }
  return context;
};
