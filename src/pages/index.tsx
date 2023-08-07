import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useUser } from 'src/context/UserContext';
import { ELocalStorageKeys } from 'src/utils/app-contants';
import { ROUTES } from 'src/utils/app-routes';

export default function Home() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const _business = localStorage.getItem(ELocalStorageKeys.USER_LOCATIONS) as any;
    const _username = localStorage.getItem(ELocalStorageKeys.USER_NAME) as any;
    const _level = localStorage.getItem(ELocalStorageKeys.LEVELS) as any;

    if (!user) router.push(ROUTES.AUTH);
    else if (_level === 'user') router.push('/shop/' + _business[0].value);
    else router.push('/' + _username + '/business');
  }, [user]);

  return <></>;
}
