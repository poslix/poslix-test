import { ItypeSelected } from '@models/common-model';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import styles from './BrandSlider.module.scss';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

const BrandSwiper = (props: any, swiper: ItypeSelected) => {
  const { onTabChange, dataItems, onCatChange } = props;
  const [isLoading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedCat, setSelectedCat] = useState(0);
  const [selectedTab, setSelectedTab] = useState('category');
  const [activeCatId, setActiveCatId] = useState(0);
  const [activeBrdId, setActiveBrdId] = useState(0);

  //Eslam 19
  useEffect(() => {
    setSelectedTab(onTabChange);
    if (selectedTab == 'brand') setItems([{ id: 0, name: 'All' }, ...dataItems.brands]);
    else if (selectedTab == 'category') setItems([{ id: 0, name: 'All' }, ...dataItems.cats]);
  }, [selectedTab, dataItems]);

  const CategoryBrandSelector = (idx: any) => {
    onCatChange(idx);
    setSelectedCat(idx);
  };

  const onClickHandler = (id: any) => {
    if (selectedTab == 'category') {
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
  };

  if (isLoading)
    return (
      <div className="swiper responsive-swiper rounded mb-3">
        <div className="swiper-wrapper">
          <div className="swiper-slide swiper-slide-active" data-swiper-slide-index={0}>
            <a className="menu-slide">
              <h2>Loading...</h2>
            </a>
          </div>
        </div>
      </div>
    );

  return (
    <div className="swiper responsive-swiper rounded mb-3">
      <Swiper
        slidesPerView={4}
        spaceBetween={10}
        navigation={true}
        modules={[Navigation]}
        autoplay={true}
        className={classNames(styles['swiper-wrapper'], 'mySwiper')}>
        {items?.map(({ name, id }, i) => {
          return (
            <SwiperSlide key={name + id}>
              <div
                className={classNames(
                  styles['item-container'],
                  'swiper-slide swiper-slide-active',
                  {
                    active:
                      (selectedTab == 'category' && activeCatId == id) ||
                      (selectedTab == 'brand' && activeBrdId == id),
                  }
                )}
                onClick={() => onClickHandler(id)}
                style={{ cursor: 'pointer' }}
                data-swiper-slide-index={2}
                role="group"
                aria-label="3 / 5">
                <a className="menu-slide">{name}</a>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default BrandSwiper;
