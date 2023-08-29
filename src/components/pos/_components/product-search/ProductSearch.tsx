import { IProduct } from '@models/pos.types';
import { Fragment, useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { useAppDispatch } from 'src/hooks';
import { addToCart } from 'src/redux/slices/cart.slice';
import api from 'src/utils/app-api';
import PackageItemsModal from '../../modals/package-item/PackageItemsModal';
import { ResultItemRow } from '../result-item-row/ResultItemRow';

export default function ProductSearch({ shopId }) {
  const dispatch = useAppDispatch();

  const [product, setProduct] = useState<IProduct>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [productVariations, setProductVariations] = useState<IProduct['variations']>([]);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const handleProductSearch = async (inputValue: string) => {
    const result = await api
      .get(`/products/search/${shopId}?search=${inputValue}`)
      .then(({ data }) => data.result);
    const options = result.map((item: IProduct) => ({
      ...item,
      value: item.id,
      label: (
        <ResultItemRow
          product={item}
          set={setProduct}
          onClick={handleAddToCart}
          setShow={setIsProductModalOpen}
        />
      ),
    }));
    return options;
  };

  const handleAddToCart = (product: IProduct) => {
    if (product.type?.includes('variable')) {
      setProductVariations(product.variations);
    } else {
      dispatch(addToCart(product));
    }
  };

  useEffect(() => {
    if (!isProductModalOpen) {
      setProductVariations([]);
      if (product) {
        setProduct(null);
        setProductVariations(null);
      }
    }
  }, [isProductModalOpen]);
  return (
    <Fragment>
      <AsyncSelect
        components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
        }}
        openMenuOnClick={true}
        menuIsOpen={isMenuOpen}
        closeMenuOnSelect={false}
        onFocus={() => setIsMenuOpen(true)}
        onBlur={() => {
          setTimeout(() => {
            setIsMenuOpen(false);
          }, 200);
        }}
        isSearchable
        placeholder="Search Product ..."
        cacheOptions
        defaultOptions
        loadOptions={handleProductSearch}
      />
      <PackageItemsModal
        show={isProductModalOpen}
        setShow={setIsProductModalOpen}
        product={product}
        variations={productVariations}
      />
    </Fragment>
  );
}
