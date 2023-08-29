import { useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import {
  addToCart,
  decreaseItemQuantity,
  removeFromCart,
  selectCartByLocation,
  setCart,
} from 'src/redux/slices/cart.slice';
import styles from './CartTable.module.scss';
import { MdDeleteForever } from 'react-icons/md';
import { BsDashLg, BsPlusLg } from 'react-icons/bs';

export default function CartTable({ lang, shopId }) {
  const selectCartForLocation = selectCartByLocation(shopId);
  const cart = useAppSelector(selectCartForLocation);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const cart = localStorage.getItem('cart');
    if (cart) dispatch(setCart(JSON.parse(cart)));
  }, []);

  return (
    <div className={styles['table__container']}>
      <Table striped hover>
        <thead>
          <tr>
            <th>#</th>
            <th>{lang?.cartComponent?.product}</th>
            <th>{lang?.cartComponent?.quantity}</th>
            <th> {lang?.cartComponent?.amount}</th>
            <th></th>
          </tr>
        </thead>

        <tbody className={styles['table-body']}>
          {!cart?.cartItems?.length && (
            <tr>
              <td colSpan={5} className="text-center">
                {lang.cartComponent.add}
              </td>
            </tr>
          )}
          {cart?.cartItems?.map((product, idx) => (
            <tr key={product.id}>
              <td>{idx + 1}</td>
              <td>{product.name}</td>
              <td>
                <span className={styles['qty-col']}>
                  <Button
                    size="sm"
                    variant="outline-info"
                    // className={styles['cart-quantity-btn']}
                    onClick={() => dispatch(decreaseItemQuantity(product))}>
                    <BsDashLg size={13} />
                  </Button>
                  <span className={styles['qty']}>{product.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline-info"
                    // className={styles['cart-quantity-btn']}
                    onClick={() => {
                      if (product.quantity < product.stock) dispatch(addToCart(product));
                    }}>
                    <BsPlusLg size={13} />
                  </Button>
                </span>
              </td>
              <td>{(product.quantity * +product.sell_price).toFixed(2)}</td>
              <td className={styles['delete-col']}>
                <Button
                  size="sm"
                  variant="outline-danger"
                  // className={styles['cart-delete-btn']}
                  onClick={() => dispatch(removeFromCart(product))}>
                  <MdDeleteForever size={15} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
