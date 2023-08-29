'use client';
import { IUserBusiness } from '@models/auth.types';
import { ILocationSettings, ITailoringExtra } from '@models/common-model';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { UserContext } from 'src/context/UserContext';
import { ROUTES } from 'src/utils/app-routes';

interface BusinessResponse {
  success: boolean;
  result: {
    locations: IUserBusiness[];
  };
}

interface BusinessError {
  error: string;
}

// Initial state for location settings
const initialLocationState: ILocationSettings = {
  // @ts-ignore
  value: 0,
  label: '',
  currency_decimal_places: 0,
  currency_code: '',
  currency_id: 0,
  currency_rate: 1,
  currency_symbol: '',
};

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>({});
  const [tailoringSizes, setTailoringSizes] = useState<string[]>([]);
  const [tailoringExtras, setTailoringExtras] = useState<ITailoringExtra[]>([]);
  const [invoicDetails, setInvoicDetails] = useState<any>({});
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>(initialLocationState);
  const router = useRouter();

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
    const language = window.localStorage.getItem('lang');
    if (!language) window.localStorage.setItem('lang', 'en');

    getSession().then((session) => {
      if (session) {
        setUser(session.user);
      } else {
        router.replace(ROUTES.AUTH);
      }
    });
  }, []);

  return (
    <UserContext.Provider value={userContext}>
      {/* Render child components */}
      {children}
    </UserContext.Provider>
  );
}
