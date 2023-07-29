import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

const Home: NextPage = () => {
  const router = useRouter()
  const btnclick = () => {
    router.push("/user/login")
  }
  useEffect(() => {
    router.push("/user/login")
  }, [])

  return (<></>)
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Poslix</title>
        <link href="https://fonts.googleapis.com/css?family=Lato:400,400i|Roboto:500" rel="stylesheet" />
        <link rel="stylesheet" href="../css/land_style.css" />
        <script src="https://unpkg.com/scrollreveal@4.0.0/dist/scrollreveal.min.js"></script>
      </Head>
      <body className="is-boxed has-animations">
        <div className="body-wrap boxed-container">
          <header className="site-header">
            <div className="container">
              <div className="site-header-inner">
                <div className="brand header-brand">
                </div>
              </div>
            </div>
          </header>

          <main>
            <section className="hero text-center">
              <div className="container-sm mainpage-con">
                <img src='/images/logo1.png' />
                <h3>Make Your Business Online</h3>
                <h6>Few Steps To Be Online!</h6>
                <button className='btn btn-primary' onClick={btnclick}> Let's Start </button>
              </div>
            </section>



          </main>
        </div>

        <script src="../js/main.min.js"></script>
      </body>
    </>
  )
}

export default Home
