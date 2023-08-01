import { NextPage } from "next";
import React, { useEffect, useState, useContext } from "react";
import { IproductInfo } from "../../models/common-model";
import BrandSwiper from "./utils/BrandSlider";
import ClipLoader from "react-spinners/ClipLoader";
import { ItemCard } from "./utils/ItemCard";
import { TabPanel } from "./utils/TabPanel";
import { CSSProperties } from "react";
import { ProductContext } from "../../context/ProductContext"
import { useRecoilState } from "recoil";
import { cartJobType } from "src/recoil/atoms";


export const ItemList: any = (props: any) => {
  const {lang} = props

  const [selectedTab, setSelectedTab] = useState('category');
  const [isLoading, setIsLoading] = useState(true)
  const { products, cats, brands } = useContext(ProductContext);
  const [selectedCat, setSelectedCat] = useState(0);
  const [productsItems, SetProductsItems] = useState<IproductInfo[]>([]);
  const [selectedBrand, setSelectedBrand] = useState(0);
  const [jobType] = useRecoilState(cartJobType);

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "48b7b9",
  };
  useEffect(() => {
    SetProductsItems(products.products)
    setIsLoading(false)
  }, [products.products])

  useEffect(() => {
    if (jobType.req == 102)
      setIsLoading(true)
  }, [jobType])

  return (
    <div className="card" style={{ width: '60%' }}>
      <div className="card-body">
        {/* TabPanel   */}
        <TabPanel onTabChange={(value: any) => {
          setSelectedTab(value)
          setIsLoading(false)
        }} lang={lang} />
        {/* Swiper   */}
        <BrandSwiper onTabChange={selectedTab} onCatChange={(value: any) => {
          if (selectedTab == 'category')
            setSelectedCat(value)
          else
            setSelectedBrand(value)

          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
          }, 100)
        }} dataItems={{ cats: cats, brands: brands }} />

        {
          isLoading ?
            <ClipLoader color="48b7b9" loading={isLoading} cssOverride={override} size="150" /> :
            (
              <div className="tab-content text-muted">
                <div
                  className="tab-pane active products"
                  id="nav-border-justified-section"
                  role="tabpanel"
                  data-simplebar=""
                  style={{ height: "calc(100vh - 200px)" }}
                >
                  <div className="items-list">
                    {
                      //cat section
                      (selectedTab == 'category' ?
                        productsItems ? productsItems.filter((val: any) => selectedCat == 0 ? val.category_id != 0 : val.category_id == selectedCat).map((prod: any, idx) =>
                          <div className="items-list-pos" key={idx}>
                            <ItemCard
                              items={prod}
                            />
                          </div>
                        ) : ''
                        //brand section
                        : productsItems ? productsItems.filter((val: any) => selectedBrand == 0 ? val.brand_id != 0 : val.brand_id == selectedBrand).map((prod: any, idx) =>
                          <div className="items-list-pos" key={idx}>
                            <ItemCard
                              items={prod}
                            />
                          </div>
                        ) : ''
                      )
                    }
                  </div>
                  {/* end row */}
                </div>
              </div>
            )

        }

      </div>
      {/* end card body */}
    </div>
  );
};
