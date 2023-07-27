import '@styles/globals.scss'
import '@styles/_pos_custom.css'
import '@styles/loyalty.css'
import type { AppProps } from 'next/app'
import React, { useState } from 'react'

// Next.js allows you to import CSS directly in .js files.
// It handles optimization and all the necessary Webpack configuration to make this work.
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { SSRProvider } from 'react-bootstrap'
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import { RecoilRoot } from 'recoil';
import { ProductContext } from "../context/ProductContext"
import { UserContext } from "../context/UserContext"
import NextNProgress from 'nextjs-progressbar';
import { ILocationSettings, ITailoringExtra, IinvoiceDetails } from '@models/common-model'
import { defaultInvoiceDetials } from '@models/data'
import { DarkModeProvider } from 'src/context/DarkModeContext'
import "../../public/css/products.modules.css";

// You change this configuration value to false so that the Font Awesome core SVG library
// will not try and insert <style> elements into the <head> of the page.
// Next.js blocks this from happening anyway so you might as well not even try.
// See https://fontawesome.com/v6/docs/web/use-with/react/use-with#next-js
config.autoAddCss = false

const options = {
  // you can also just use 'bottom center'
  position: positions.BOTTOM_CENTER,
  timeout: 5000,
  offset: '30px',
  // you can also just use 'scale'
  transition: transitions.SCALE
}
function MyApp({ Component, pageProps }: AppProps) {
  // In server-side rendered applications, a SSRProvider must wrap the application in order
  // to ensure that the auto-generated ids are consistent between the server and client.
  // https://react-bootstrap.github.io/getting-started/server-side-rendering/
  // eslint-disable-next-line react/jsx-props-no-spreading

  const [products, setProducts] = useState<any>();
  const [packageItems, setPackageItems] = useState<any>();
  const [variations, setVariations] = useState<any>();
  const [customers, setCustomers] = useState([]);
  const [user, setUser] = useState<any>({});
  const [cats, setCats] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [taxGroups, setTaxGroups] = useState<any>([]);
  const [brands, setBrands] = useState([]);
  const [tailoringSizes, setTailoringSizes] = useState([]);
  const [invoicDetails, setInvoicDetails] = useState<any>(defaultInvoiceDetials);
  const [tailoringExtras, setTailoringExtras] = useState<ITailoringExtra[]>();
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({ value: 0, label: "", currency_decimal_places: 0, currency_code: '', currency_id: 0, currency_rate: 1, currency_symbol: '' })

  return (<>
    <RecoilRoot >
      <SSRProvider>
        <DarkModeProvider>

        <UserContext.Provider value={{ user, setUser, locationSettings, setLocationSettings, tailoringSizes, setTailoringSizes, invoicDetails, setInvoicDetails, tailoringExtras, setTailoringExtras }}>
          <ProductContext.Provider value={{ products, setProducts, cats, setCats, brands, setBrands, customers, setCustomers, taxes, setTaxes, taxGroups, setTaxGroups, variations, setVariations, packageItems, setPackageItems }}>
            <>
              <NextNProgress />
              <Component {...pageProps} />
            </>
          </ProductContext.Provider>
        </UserContext.Provider>
        </DarkModeProvider>
      </SSRProvider>
    </RecoilRoot>
  </>

  )
}
export default MyApp