import { IProduct } from '@models/pos.types';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { MdAllInbox } from 'react-icons/md';
import { useUser } from 'src/context/UserContext';
import { useAppDispatch } from 'src/hooks';
import { addToCart } from 'src/redux/slices/cart.slice';
import PackageItemsModal from '../../modals/package-item/PackageItemsModal';
import styles from './ItemCard.module.scss';

export const ItemCard = ({ product }: { product: IProduct }) => {
  const dispatch = useAppDispatch();
  const { locationSettings } = useUser();

  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [productVariations, setProductVariations] = useState<IProduct['variations']>([]);

  const handleAddToCart = () => {
    if (product.type?.includes('variable')) {
      setProductVariations(product.variations);
      setIsOpenDialog(true);
    } else {
      dispatch(addToCart(product));
    }
  };

  useEffect(() => {
    if (!isOpenDialog) setProductVariations([]);
  }, [isOpenDialog]);

  if (!product) return <div>No product defined</div>;

  return (
    <>
      <button
        onClick={() => {
          handleAddToCart();
        }}
        className={styles['item-card__container']}>
        {product.type === 'variable' && (
          <div className={styles['item-card__container--variable']}>
            <MdAllInbox />
          </div>
        )}

        <div className={classNames('product-img')}>
          <div className="img-container">
            <img
              src={product.image?.length > 10 ? product.image : '/images/pos/placeholder.png'}
              alt={product.name}
              className="img-fluid"
            />
          </div>
        </div>
        <h5 className="item-name">{product.name}</h5>
        <div className="item-price">
          {!product.type?.includes('variable')
            ? Number(product.sell_price).toFixed(3) + locationSettings?.currency_code
            : '--'}
        </div>
        {!product.is_service &&
          !product.type?.includes('variable') &&
          !product.type?.includes('package') &&
          product.stock == 0 &&
          !product.sell_over_stock && <div className="out-of-stock">Out Of Stock</div>}

        <div className="item-icons">
          {!product.is_service && (
            <div className="inner-icon">
              <img src="/images/pos/card/over_sell.png" />
            </div>
          )}
        </div>
      </button>
      <PackageItemsModal
        product={product}
        variations={productVariations ?? []}
        show={isOpenDialog}
        setShow={setIsOpenDialog}
      />
    </>
  );
};
