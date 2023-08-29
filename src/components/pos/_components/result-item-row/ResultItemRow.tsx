import { IProduct } from '@models/pos.types';
import { Dispatch, Fragment, SetStateAction, useEffect, useRef, useState } from 'react';
import { MdAllInbox } from 'react-icons/md';
import { useUser } from 'src/context/UserContext';
import { useAppDispatch } from 'src/hooks';

export const ResultItemRow = ({
  product,
  set,
  setShow,
  onClick,
}: {
  product: IProduct;
  set: Dispatch<SetStateAction<IProduct>>;
  setShow: Dispatch<SetStateAction<boolean>>;
  onClick?: (product: IProduct) => void;
}) => {
  const dispatch = useAppDispatch();
  const { locationSettings } = useUser();
  const ref = useRef<HTMLParagraphElement>(null);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [productVariations, setProductVariations] = useState<IProduct['variations']>([]);

  const handleAddToCart = () => {
    set(product);
    setShow(true);
    onClick && onClick(product);
  };

  useEffect(() => {
    if (!isOpenDialog) setProductVariations([]);
  }, [isOpenDialog]);

  useEffect(() => {
    ref?.current?.addEventListener('click', handleAddToCart);
    return () => {
      ref?.current?.removeEventListener('click', handleAddToCart);
    };
  }, [ref, handleAddToCart]);

  if (!product) return <div>No product defined</div>;

  return (
    <Fragment key={product.id + '-search-items'}>
      <p ref={ref}>
        <span>{product.name}</span>

        {product.type?.includes('variable') ? (
          <span
            style={{
              fontSize: '0.8rem',
              color: '#999',
            }}>
            {' '}
            | <MdAllInbox className="d-inline" />
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.8rem',
              color: '#999',
            }}>
            {' '}
            | {(+product.cost_price).toFixed(+locationSettings.location_decimal_places || 2)}{' '}
            {locationSettings.currency_name}
          </span>
        )}
      </p>
      {/* 
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
      </button> */}
    </Fragment>
  );
};
