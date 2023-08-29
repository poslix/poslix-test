import { IUser } from '@models/auth.types';
import { ILocationSettings, ITailoringExtra, IinvoiceDetails } from '@models/common-model';
import { createContext, useContext } from 'react';

export const UserContext = createContext({
  user: {
    id: 0,
    level: '',
    locs: [],
  } as any as IUser,
  setUser: (user: IUser) => {},
  locationSettings: {
    currency_code: '',
    currency_name: '',
    currency_symbol: '',
    currency_id: 0,
    location_decimal_places: 0,
    location_id: 0,
    location_name: '',
  } as ILocationSettings,
  setLocationSettings: (locationSettings: ILocationSettings) => {},
  tailoringSizes: [],
  setTailoringSizes: (tailoringSizes: any) => {},
  invoicDetails: {
    logo: '',
    footer: '',
    footer2: '',
    footersecond: '',
    name: '',
    tell: '',
    date: new Date(),
    isMultiLang: false,
    orderNo: '',
    orderNo2: '',
    txtDate: '',
    txtDate2: '',
    txtQty: '',
    txtQty2: '',
    txtItem: '',
    txtItem2: '',
    txtAmount: '',
    txtAmount2: '',
    txtTax: '',
    txtTax2: '',
    txtDiscount: '',
    txtDiscount2: '',
    txtTotal: '',
    txtTotal2: '',
    txtAmountpaid: '',
    txtAmountpaid2: '',
    txtTotalDue: '',
    txtTotalDue2: '',
    txtCustomer: '',
    txtCustomer2: '',
  },
  setInvoicDetails: (invoicDetails: IinvoiceDetails) => {},
  tailoringExtras: [],
  setTailoringExtras: (tailoringExtras: ITailoringExtra[]) => {},
});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};
