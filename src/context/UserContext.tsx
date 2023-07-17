import { ILocationSettings, ITailoringExtra, IinvoiceDetails } from "@models/common-model";
import { createContext } from "react";


export const UserContext = createContext({
    user: [],
    setUser: (user: any) => { },
    locationSettings: { value: 0, label: "", currency_decimal_places: 0, currency_code: '', currency_id: 0, currency_rate: 1, currency_symbol: '' },
    setLocationSettings: (locationSettings: ILocationSettings) => { },
    tailoringSizes: [],
    setTailoringSizes: (tailoringSizes: any) => { },
    invoicDetails: { logo: '', footer: "", footer2: "", name: '', tell: "", date: new Date(), isMultiLang: false, orderNo: '', orderNo2: "", txtDate: '', txtDate2: "", txtQty: "", txtQty2: "", txtItem: "", txtItem2: "", txtAmount: "", txtAmount2: "", txtTax: "", txtTax2: "", txtTotal: "", txtTotal2: "", txtCustomer: "", txtCustomer2: "" },
    setInvoicDetails: (invoicDetails: IinvoiceDetails) => { },
    tailoringExtras: [],
    setTailoringExtras: (tailoringExtras: ITailoringExtra[]) => { },
});
