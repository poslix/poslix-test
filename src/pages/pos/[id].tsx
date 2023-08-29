'use client';
import { faCashRegister } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICustomer, ITax } from '@models/pos.types';
import ar from 'ar.json';
import en from 'en.json';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import withAuth from 'src/HOCs/withAuth';
import CartPanel from 'src/components/pos/_components/cart-panel/CartPanel';
import { ItemList } from 'src/components/pos/_components/item-list/ItemList';
import NavMenu from 'src/components/pos/parts/NavMenu';
import { useProducts } from 'src/context/ProductContext';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import { apiFetchCtr, apiInsertCtr } from 'src/libs/dbUtils';
import PosLayout from 'src/modules/pos/_components/layout/pos.layout';
import { cartJobType } from 'src/recoil/atoms';
import { useGetBusinessLocation } from 'src/services/business.service';
import {
  useBrandsList,
  useCategoriesList,
  useCustomersList,
  useProductsList,
  useTaxesList,
} from 'src/services/pos.service';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';

import 'remixicon/fonts/remixicon.css';

const Home: NextPage = ({ shopId: _id }: any) => {
  const router = useRouter();

  const [lang, setLang] = useState(en);
  const [shopId, setShopId] = useState(_id);
  const [cusLocs, setCusLocs] = useState([]);
  const [cashHand, setCashHand] = useState(0);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenRegister, setIsOpenRegister] = useState(true);

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
  } = useProducts();

  const { setLocationSettings, setTailoringSizes, setInvoicDetails, setTailoringExtras } =
    useUser();

  useGetBusinessLocation(shopId, {
    onSuccess(data) {
      setLocationSettings(data?.result ?? {});
    },
  });

  useCustomersList(shopId, {
    onSuccess(data) {
      const _customers = data?.result?.map((el: ICustomer) => ({
        ...el,
        value: el.id,
        label: `${el.first_name} ${el.last_name} | ${el.mobile}`,
        isNew: false,
      }));
      setCustomers(_customers);
    },
  });

  useProductsList(shopId, {
    onSuccess(data) {
      const _products = data?.result?.data;
      setProducts(_products);
    },
  });

  useCategoriesList(shopId, {
    onSuccess(data) {
      const _cats = data?.result;
      setCats(_cats);
    },
  });

  useTaxesList(shopId, {
    onSuccess(data) {
      const _taxes = data?.result?.taxes as ITax;
      setTaxes(_taxes);
      setTaxGroups(data?.result?.tax_group);
    },
  });

  useBrandsList(shopId, {
    onSuccess(data) {
      const _brands = data?.result;
      setBrands(_brands);
    },
  });

  /** ********************************************************** */
  useEffect(() => {
    const locs = getLocalStorage<any[]>(ELocalStorageKeys.CUSTOEMR_LOCATIONS) ?? [];

    setCusLocs(locs);
    setLocations(locs?.[0]?.locations);
    if (jobType.req == 101) setIsOpenRegister(false);
    else if (jobType.req == 102) initData();
  }, [jobType]);

  async function initData() {
    const { success, data } = await apiFetchCtr({
      fetch: 'pos',
      subType: 'getPosInit',
      shopId,
    });
    if (!success) {
      Toastify('error', 'error..Try Again');
      return;
    }

    setVariations(data.variations);
    setPackageItems(data.packageItems);
    setTailoringExtras(data.tailoring_extras);

    setTailoringSizes(data.AllSizes);
    if (data.invoiceDetails != null && data.invoiceDetails.length > 10)
      setInvoicDetails(JSON.parse(data.invoiceDetails));
    else {
    }
    const _locs = JSON.parse(localStorage.getItem('userlocs') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(_locs[_locs.findIndex((loc: any) => loc?.value == shopId)] ?? {});
    else Toastify('error', 'errorr location settings');

    setIsLoading(false);
    if (data.cash.length > 0 && data.cash[0].status == 'open') {
      setIsOpenRegister(true);
      setIsLoading(false);
    }
  }
  async function openRegister() {
    const { success } = await apiInsertCtr({
      type: 'customer',
      subType: 'opens',
      cashHand,
      shopId,
    });
    if (!success) {
      alert('error..Try Again');
      return;
    }
    localStorage.setItem('hand_in_cash', cashHand.toString());
    router.replace(`/pos/${shopId}`);
    // initData();
    setIsOpenRegister(true);
    setIsLoading(false);
  }

  const handleBussinesChange = (e: any) => {
    const idx = cusLocs.findIndex((el) => el.bus_id == e.target?.value);
    const locs = cusLocs[idx].locations;
    setLocations(locs);
    setShopId(locs?.[0]?.loc_id);
  };

  const handelLocationChange = (e: any) => {
    setShopId(e.target?.value);
  };

  if (isLoading)
    return (
      <PosLayout>
        <div className="pos-loading">
          <div>
            <div className="snippet" data-title="dot-flashing">
              <div className="stage">
                <div className="dot-flashing" />
              </div>
            </div>
          </div>
        </div>
      </PosLayout>
    );

  if (isOpenRegister)
    return (
      <PosLayout>
        <NavMenu shopId={shopId} lang={lang} setLang={setLang} />

        <CartPanel shopId={shopId} lang={lang.pos} direction={lang == ar ? 'rtl' : ''} />
        {/* <OrdersComponent shopId={shopId} lang={lang.pos} direction={lang == ar ? 'rtl' : ''} /> */}
        <ItemList shopId={shopId} lang={lang.pos.itemList} />
      </PosLayout>
    );

  return (
    <PosLayout>
      <div className="open-register">
        <img className="logo" src="/images/logo1.png" />
        <p>You have Open Register First!</p>

        {/* mohamed elsayed reg */}
        <div className="col-lg-4 mb-3">
          <label>Bussnies</label>
          <select className="form-select" onChange={handleBussinesChange}>
            {cusLocs?.map((el) => (
              <option key={el.bus_id} value={el.bus_id}>
                {el.bus_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-lg-4 mb-3">
          <label>Location</label>
          <select className="form-select" onChange={handelLocationChange}>
            {locations?.map((el) => (
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
            setCashHand(+e.target?.value);
          }}
        />
        <button className="btn btn-primary p-3" onClick={() => openRegister()}>
          <FontAwesomeIcon icon={faCashRegister} /> Open Register{' '}
        </button>
      </div>
    </PosLayout>
  );
};

export default withAuth(Home);

export async function getServerSideProps(context: any) {
  return {
    props: {
      shopId: context.query.id,
      rules: { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true },
    },
  };
}
