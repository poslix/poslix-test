import { createContext } from "react";
import { IreadyGroupTax } from "../models/common-model"
export const ProductContext = createContext({
    products: { products: [], products_multi: [] },
    setProducts: (products: any) => { },
    cats: [],
    setCats: (cats: any) => { },
    brands: [],
    setBrands: (cats: any) => { },
    customers: [],
    setCustomers: (customers: any) => { },
    taxes: [],
    setTaxes: (taxes: any) => { },
    taxGroups: [],
    setTaxGroups: (taxGroups: IreadyGroupTax) => { },
    variations: { variations: [], variations_multi: [] },
    setVariations: (variations: any) => { },
    packageItems: [],
    setPackageItems: (packageItems: any) => { }
});