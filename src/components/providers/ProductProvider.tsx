import { ITax, ITaxGroup } from '@models/pos.types';
import { useState } from 'react';
import { ProductContext } from 'src/context/ProductContext';

export default function ProductProvider({ children }) {
  const [cats, setCats] = useState([]);
  const [taxes, setTaxes] = useState<ITax[]>([]);
  const [brands, setBrands] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState<any>();
  const [taxGroups, setTaxGroups] = useState<ITaxGroup[]>([]);
  const [variations, setVariations] = useState<any>();
  const [packageItems, setPackageItems] = useState<any>();

  const productContext = {
    products,
    setProducts,
    cats,
    setCats,
    brands,
    setBrands,
    customers,
    setCustomers,
    taxes,
    setTaxes,
    taxGroups,
    setTaxGroups,
    variations,
    setVariations,
    packageItems,
    setPackageItems,
  };

  return <ProductContext.Provider value={productContext}>{children}</ProductContext.Provider>;
}
