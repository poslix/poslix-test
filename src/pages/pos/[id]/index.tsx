import type { NextPage } from 'next'
import { useRouter } from "next/router";
import Head from 'next/head'
import Script from 'next/script'
import { useRecoilState } from "recoil";
import { OrdersComponent } from '../../../components/pos/CartComponent'
import { ItemList } from '../../../components/pos/ItemList'
import NavMenu from '../../../components/pos/parts/NavMenu'
import 'remixicon/fonts/remixicon.css'
import { ChangeEvent, useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCashRegister } from '@fortawesome/free-solid-svg-icons'
import { cartJobType } from '../../../recoil/atoms';
import { apiFetchCtr, apiInsert, apiInsertCtr } from 'src/libs/dbUtils';
import { ProductContext } from "../../../context/ProductContext"
import * as cookie from 'cookie'
import { hasPermissions, isNumber, keyValueRules, locationPermission, verifayTokens } from '../../api/checkUtils';
import { ITokenVerfy } from '@models/common-model';
import { UserContext } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import en from 'en.json'
import ar from 'ar.json'
import { log } from 'console';

const Home: NextPage = (probs: any) => {
  // const { shopId } = probs
  /* Eslam 20  */
  const router = useRouter();
  const [shopId, setShopId] = useState(probs.shopId);
  console.log("location id", shopId);

  const [isOpenRegister, setIsOpenRegister] = useState(false);
  const [jobType] = useRecoilState(cartJobType);
  const {
    setCats,
    setBrands,
    setProducts,
    setCustomers,
    setTaxes,
    setTaxGroups,
    setVariations,
    setPackageItems,
  } = useContext(ProductContext);
  const {
    setLocationSettings,
    setTailoringSizes,
    setInvoicDetails,
    setTailoringExtras,
  } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [cashHand, setCashHand] = useState(0);
  const [lang, setLang] = useState(en);
  const [cusLocs, setCusLocs] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    var locs = JSON.parse(localStorage.getItem("cusLocs"));
    // console.log(locs);

    setCusLocs(locs);
    setLocations(locs[0].locations);
    if (jobType.req == 101) setIsOpenRegister(false);
    else if (jobType.req == 102) initData();
  }, [jobType]);

  async function initData() {
    const { success, data } = await apiFetchCtr({
      fetch: "pos",
      subType: "getPosInit",
      shopId,
    });
    if (!success) {
      Toastify("error", "error..Try Again");
      return;
    }
    setCats(data.cats);
    setTaxes(data.taxes);
    setBrands(data.brands);
    setTaxGroups(data.tax_group);
    setProducts(data.stockedProducts);
    setVariations(data.variations);
    setPackageItems(data.packageItems);
    setTailoringExtras(data.tailoring_extras);
    setCustomers([
      { value: "1", label: "walk-in customer", isNew: false },
      ...data.customers,
    ]);
    setTailoringSizes(data.AllSizes);
    if (data.invoiceDetails != null && data.invoiceDetails.length > 10)
      setInvoicDetails(JSON.parse(data.invoiceDetails));
    else {
      console.log("errorrrr default invoice");
    }
    var _locs = JSON.parse(localStorage.getItem("userlocs") || "[]");
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.value == shopId;
          })
        ]
      );
    else Toastify("error", "errorr location settings");

    setIsLoading(false);
    if (data.cash.length > 0 && data.cash[0].status == "open") {
      setIsOpenRegister(true);
      setIsLoading(false);
    }
  }
  async function openRegister() {
    const { success } = await apiInsertCtr({
      type: "customer",
      subType: "opens",
      cashHand,
      shopId,
    });
    if (!success) {
      console.log("has error in open Register");
      alert("error..Try Again");
      return;
    }
    localStorage.setItem("hand_in_cash", cashHand.toString());
    router.replace(`/pos/${shopId}`);
    initData();
    setIsOpenRegister(true);
    setIsLoading(false);
  }
  useEffect(() => {
    initData();
  }, []);

  const handleBussinesChange = (e: any) => {
    let idx = cusLocs.findIndex((el) => el.bus_id == e.target.value);
    let locs = cusLocs[idx].locations;
    setLocations(locs);
    setShopId(locs[0].loc_id);
  };

  const handelLocationChange = (e: any) => {
    setShopId(e.target.value);
  };
  return (
    <>
      <Head>
        <title>Poslix App</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="../libs/swiper/swiper-bundle.min.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="../css/bootstrap.min.css"
          id="bootstrap-style"
          rel="stylesheet"
          type="text/css"
        />
        <link href="../css/icons`.min.css" rel="stylesheet" type="text/css" />
        <link
          href="../css/app.css"
          id="app-style"
          rel="stylesheet"
          type="text/css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css"
        />
        <meta name="description" content="Poslix App" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest"></link>
      </Head>
      <div id="layout-wrapper">
        <div className="vertical-overlay" />
        {/* ============================================================== */}
        {/* Start right Content here */}
        {/* ============================================================== */}
        <div className="main-content">
          {!isLoading ? (
            isOpenRegister ? (
              <div className="pos-flex">
                <NavMenu shopId={shopId} lang={lang} setLang={setLang} />
                <OrdersComponent
                  shopId={shopId}
                  lang={lang.pos}
                  direction={lang == ar ? "rtl" : ""}
                />
                <ItemList lang={lang.pos.itemList} />
              </div>
            ) : (
              <div className="pos-flex">
                <div className="open-register">
                  <img className="logo" src="/images/logo1.png" />
                  <p>You have Open Register First!</p>

                  {/* mohamed elsayed reg */}
                  <div className="col-lg-4 mb-3">
                    <label>Bussnies</label>
                    <select
                      className="form-select"
                      onChange={handleBussinesChange}
                    >
                      {cusLocs.map((el) => (
                        <option key={el.bus_id} value={el.bus_id}>
                          {el.bus_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-lg-4 mb-3">
                    <label>Location</label>
                    <select
                      className="form-select"
                      onChange={handelLocationChange}
                    >
                      {locations.map((el) => (
                        <option key={el.loc_id} value={el.loc_id}>
                          {el.loc_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* ------------------ */}

                  <input
                    type="number"
                    name="cemail"
                    className="form-control"
                    placeholder="Cash in hand..."
                    onChange={(e) => {
                      setCashHand(+e.target.value);
                    }}
                  />
                  <button
                    className="btn btn-primary p-3"
                    onClick={() => openRegister()}
                  >
                    <FontAwesomeIcon icon={faCashRegister} /> Open Register{" "}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="pos-loading">
              <div>
                <div className="snippet" data-title="dot-flashing">
                  <div className="stage">
                    <div className="dot-flashing"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <script src="../libs/bootstrap/js/bootstrap.bundle.min.js" async></script>
      <Script src="https://bootstrap-js.onrender.com/index.js" async />
      <Script src="../js/app.js" async />
    </>
  );
}
export default Home;
export async function getServerSideProps(context: any) {
  const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
  var _isOk = true, _hasPer = true, locHasAccess = false
  //check page params
  var shopId = context.query.id;
  if (shopId == undefined)
    return { redirect: { permanent: false, destination: "/page403" } }
  if (!isNumber(shopId))
    return { redirect: { permanent: false, destination: "/page403" } }
  //check user permissions
  var _userRules = {};
  await verifayTokens({ headers: { authorization: 'Bearer ' + parsedCookies.tokend } }, (repo: ITokenVerfy) => {
    _isOk = repo.status;
    if (locationPermission(repo.data.locs, shopId) != -1)
      locHasAccess = true;
    else if (_isOk) {
      var _rules = keyValueRules(repo.data.rules || []);
      if (_rules[-2] != undefined && _rules[-2][0].stuff != undefined && _rules[-2][0].stuff == 'owner') {
        _hasPer = true;
        _userRules = { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true };
      } else if (_rules[shopId] != undefined) {
        var _stuf = '';
        _rules[shopId].forEach((dd: any) => _stuf += dd.stuff)
        const { userRules, hasPermission } = hasPermissions(_stuf, 'products')
        _hasPer = hasPermission
        _userRules = userRules
      } else
        _hasPer = false
    }

  })
  if (!locHasAccess) return { redirect: { permanent: false, destination: "/page403" } }
  if (!_isOk) return { redirect: { permanent: false, destination: "/user/login" } }
  if (!_hasPer) return { redirect: { permanent: false, destination: "/page403" } }
  return {
    props: { shopId: context.query.id, rules: _userRules },
  };
}
