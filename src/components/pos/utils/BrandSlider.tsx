
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/css";
import { ItypeSelected } from "@models/common-model";


const BrandSwiper = (props: any, swiper: ItypeSelected) => {
  const { onTabChange, dataItems, onCatChange } = props;
  const [Loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedCat, setSelectedCat] = useState(0);
  const [selectedTab, setSelectedTab] = useState("category");
  const [activeCatId, setActiveCatId] = useState(0);
  const [activeBrdId, setActiveBrdId] = useState(0);

  //Eslam 19
  useEffect(() => {
    setSelectedTab(onTabChange);
    if (selectedTab == "brand")
      setItems([{ id: 0, name: "All" }, ...dataItems.brands]);
    else if (selectedTab == "category")
      setItems([{ id: 0, name: "All" }, ...dataItems.cats]);
  }, [selectedTab, dataItems]);

  const CategoryBrandSelector = (idx: any) => {
    onCatChange(idx);
    setSelectedCat(idx);
  };

  return (
    <>
      <div className="swiper responsive-swiper rounded mb-3">
        {Loading ? (
          "loadings.."
        ) : (
          <Swiper
            slidesPerView={4}
            spaceBetween={10}
            navigation={true}
            modules={[Navigation]}
            autoplay={true}
            className="mySwiper"
          >
            {items == null
              ? "noo"
              : items?.map(({ name, id }, i) => {
                  return (
                    <SwiperSlide key={i}>
                      <div
                        className={
                          "swiper-slide swiper-slide-active" &&
                          (selectedTab == "category"
                            ? activeCatId == id
                              ? "selectedCatClass"
                              : ""
                            : activeBrdId == id
                            ? "selectedCatClass"
                            : "")
                        }
                        onClick={() => {
                          if (selectedTab == "category") {
                            if (id == activeCatId) {
                              setActiveCatId(0);
                              CategoryBrandSelector(0);
                            } else {
                              setActiveCatId(id);
                              CategoryBrandSelector(id);
                            }
                          } else {
                            if (id == activeBrdId) {
                              setActiveBrdId(0);
                              CategoryBrandSelector(0);
                            } else {
                              setActiveBrdId(id);
                              CategoryBrandSelector(id);
                            }
                          }
                        }}
                        style={{ cursor: "pointer" }}
                        data-swiper-slide-index={2}
                        role="group"
                        aria-label="3 / 5"
                      >
                        <a className="menu-slide">
                          <h2>{name}</h2>
                        </a>
                      </div>
                    </SwiperSlide>
                  );
                })}
          </Swiper>
        )}
      </div>
    </>
  );
};

export default BrandSwiper;