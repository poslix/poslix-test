import type { NextPage } from 'next'
import Image from 'next/image'
import { OwnerAdminLayout } from '@layout'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import BusinessList from 'src/components/dashboard/BusinessList'
import Locations from 'src/components/dashboard/Locations'
import { isLogin } from "../../libs/loginlib"

const Home: NextPage = () => {

  const router = useRouter()
  const slug = router.query.slug;
  const [pageType, setPageType] = useState('/');


  useEffect(() => {

    if (!isLogin())
      router.push('/user/register')

    console.log(slug);


    if (slug != undefined) {
      //if (slug.length < 2)
      ///router.push('/erro404')
      if (slug[1] === 'business')
        setPageType('business_list')
      if (slug[1] === 'reports')
        setPageType('general_settings')

    }

  }, [slug])


  return (
    <>
      <OwnerAdminLayout>
        {pageType}
        {pageType == 'business_list' && <BusinessList />}
        {pageType == 'users' && <Locations />}
      </OwnerAdminLayout>
    </>
  )
}
export default Home;
