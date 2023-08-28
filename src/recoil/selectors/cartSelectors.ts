import { selector } from 'recoil';
import { cartState } from '../atoms/cartState';

export const cartTotalSelector = selector({
  key: 'cartTotalSelector',
  get: ({ get }) => {
    const cart = get(cartState);
    return cart.reduce((total, product) => total + +product.product.cost_price, 0);
  },
});
