import { IProduct, IVariation } from '@models/pos.types';
import { Button, Modal } from 'react-bootstrap';
import { MdAddShoppingCart } from 'react-icons/md';
import { useUser } from 'src/context/UserContext';
import { useAppDispatch } from 'src/hooks';
import styles from './PackageItemsModal.module.scss';
import { Dispatch, SetStateAction } from 'react';
import { addToCart } from 'src/redux/slices/cart.slice';

const PackageItemsModal = ({
  product,
  variations,
  show,
  setShow,
}: {
  product: IProduct;
  variations: IVariation[];
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) => {
  const dispatch = useAppDispatch();
  const { locationSettings } = useUser();

  const handleClose = () => {
    setShow(false);
  };
  const handleAddItem = (item: IVariation) => {
    if (+item.stock < 1) return;
    const _product: IProduct = {
      ...product,
      ...item,
      name: product.name + ' | ' + item.name,
      sell_price: +item.price,
      cost_price: +item.cost,
    } as any;
    dispatch(addToCart(_product));
    setShow(false);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
        Package Content{' '}
      </Modal.Header>
      <Modal.Body>
        <div className={styles['items__container']}>
          {variations?.map((v, i: number) => {
            return (
              <button
                onClick={() => handleAddItem(v)}
                className={styles['item']}
                disabled={+v.stock < 1}
                key={v.id}>
                <div className={styles['icon']}>
                  <MdAddShoppingCart />
                </div>
                <h4 className={styles['name']}>{v.name}</h4>
                <h5 className={styles['amount']}>
                  {Number(v.price).toFixed(2)} {locationSettings?.currency_name}
                </h5>
                <h6 className={styles['remaining']}>{+v.stock} remaining</h6>
              </button>
            );
          })}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PackageItemsModal;
