import { createContext } from "react";

export const CustomerContext = createContext({
    customers: [],
    setCustomers: (customers: any) => { },
});