import { ILocationSettings, ITailoringExtra } from '@models/common-model';
import { defaultInvoiceDetials } from '@models/data';
import { setCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import { UserContext } from 'src/context/UserContext';
import { getDecodedToken, getToken } from 'src/libs/loginlib';
import { ELocalStorageKeys } from 'src/utils/app-contants';

const initialLocationState = {
  value: 0,
  label: '',
  currency_decimal_places: 0,
  currency_code: '',
  currency_id: 0,
  currency_rate: 1,
  currency_symbol: '',
};

export default function UserProvider({ children }) {
  const [user, setUser] = useState<any>({});

  const [tailoringSizes, setTailoringSizes] = useState([]);
  const [tailoringExtras, setTailoringExtras] = useState<ITailoringExtra[]>();
  const [invoicDetails, setInvoicDetails] = useState<any>(defaultInvoiceDetials);
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>(initialLocationState);

  const userContext = {
    user,
    setUser,
    locationSettings,
    setLocationSettings,
    tailoringSizes,
    setTailoringSizes,
    invoicDetails,
    setInvoicDetails,
    tailoringExtras,
    setTailoringExtras,
  };

  useEffect(() => {
    const user = getDecodedToken();

    if (user) {
      setCookie(ELocalStorageKeys.TOKEN_COOKIE, getToken() ?? '');
      setUser(user);
    }
  }, []);

  return <UserContext.Provider value={userContext}>{children}</UserContext.Provider>;
}
