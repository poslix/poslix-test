import { config } from '@fortawesome/fontawesome-svg-core';
import type { AppProps } from 'next/app';
import NextNProgress from 'nextjs-progressbar';
import { SSRProvider } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import { RecoilRoot } from 'recoil';
import { ProductProvider, UserProvider } from 'src/components/providers';
import { DarkModeProvider } from 'src/context/DarkModeContext';

// CSS
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@styles/_pos_custom.css';
import '@styles/globals.scss';
import '@styles/loyalty.css';
import Head from 'next/head';
import '../../public/css/products.modules.css';

config.autoAddCss = false;

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Poslix App</title>
      </Head>

      <RecoilRoot>
        <SSRProvider>
          <DarkModeProvider>
            <UserProvider>
              <ProductProvider>
                <NextNProgress />
                <Component {...pageProps} />
                <ToastContainer />
              </ProductProvider>
            </UserProvider>
          </DarkModeProvider>
        </SSRProvider>
      </RecoilRoot>
    </>
  );
}
