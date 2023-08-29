import { OwnerAdminLayout } from '@layout';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BusinessList from 'src/components/dashboard/BusinessList';
import Locations from 'src/components/dashboard/Locations';

const Home: NextPage = () => {
  const router = useRouter();
  const slug = router.query.slug;
  const [pageType, setPageType] = useState('/');

  useEffect(() => {
    if (slug != undefined) {
      //if (slug.length < 2)
      ///router.push('/erro404')
      if (slug[1] === 'business') setPageType('business_list');
      if (slug[1] === 'reports') setPageType('general_settings');
    }
  }, [slug]);

  return (
    <OwnerAdminLayout>
      {pageType}
      {pageType == 'business_list' && <BusinessList />}
      {pageType == 'users' && <Locations />}
    </OwnerAdminLayout>
  );
};
export default Home;
