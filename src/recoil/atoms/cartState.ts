import { IProduct } from '@models/pos.types';
import { atom } from 'recoil';

export const cartState = atom<{ product: IProduct; quantity: number }[]>({
  key: 'cartState',
  default: [],
});
