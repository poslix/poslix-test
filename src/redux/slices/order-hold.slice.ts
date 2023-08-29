import { IProduct } from '@models/pos.types';
import { createSelector, createSlice, current } from '@reduxjs/toolkit';

type IHoldProduct = IProduct & {
  quantity: number;
  product_id: number;
  variation_id?: number | null;
};

interface IHold {
  location_id: number;
  customer_id?: number;
  items: IHoldProduct[];
  totalSell: number;
  totalCost: number;
  discount?: number;
  tax?: number;
  taxType?: 'fixed' | 'percentage';
  discountType?: 'fixed' | 'percentage';
  shipping?: number;
  payment?: {
    payment_id: number | string;
    amount: number;
    note: string;
  }[];
}

const initialState: IHold[] = [];

const findOrCreateHold = (state: IHold[], location_id: string): IHold => {
  const existingHold = state.find((hold) => +hold.location_id === +location_id);

  if (existingHold) {
    return existingHold;
  } else {
    const newHold: IHold = {
      location_id: +location_id,
      items: [],
      totalSell: 0,
      totalCost: 0,
      discount: 0,
      tax: 0,
      taxType: 'fixed',
      discountType: 'fixed',
      shipping: 0,
    };
    state.push(newHold);
    return newHold;
  }
};

const holdSlice = createSlice({
  name: 'hold',
  initialState,
  reducers: {
    setHold: (state, action) => {
      return action.payload;
    },
    setHoldCustomer: (state, action) => {
      const { location_id, customer_id } = action.payload;
      const hold = findOrCreateHold(state, location_id);
      hold.customer_id = customer_id;
      localStorage.setItem('holdCart', JSON.stringify(state));
    },
    setHoldTax: (state, action) => {
      const { location_id, tax, type } = action.payload;
      const hold = findOrCreateHold(state, location_id);
      hold.tax = +tax;
      hold.taxType = type;
      localStorage.setItem('holdCart', JSON.stringify(state));
    },
    setHoldDiscount: (state, action) => {
      const { location_id, discount, type } = action.payload;
      const hold = findOrCreateHold(state, location_id);
      hold.discount = +discount;
      hold.discountType = type;
      localStorage.setItem('holdCart', JSON.stringify(state));
    },
    addToHold: (state, action) => {
      const { id, location_id } = action.payload;
      console.log(current(state));
      const hold = findOrCreateHold(state, location_id);
      const existingItem = hold.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        hold.items.push({ ...action.payload, product_id: id, quantity: 1 });
      }
      console.log(id, location_id, hold);

      hold.totalSell += +action.payload.sell_price;
      hold.totalCost += +action.payload.cost_price;
      localStorage.setItem('holdCart', JSON.stringify(state));
    },
    removeFromHold: (state, action) => {
      const { id, location_id } = action.payload;
      const hold = findOrCreateHold(state, location_id);
      const existingItem = hold.items.find((item) => item.id === id);

      if (existingItem) {
        hold.items = hold.items.filter((item) => item.id !== id);
        hold.totalSell -= +action.payload.sell_price * +existingItem.quantity;
        hold.totalCost -= +action.payload.cost_price * +existingItem.quantity;
        localStorage.setItem('holdCart', JSON.stringify(state));
      }
    },
    clearHold: (state, action) => {
      const hold = findOrCreateHold(state, action.payload.location_id);
      hold.items = [];
      hold.totalSell = 0;
      hold.totalCost = 0;

      localStorage.setItem('holdCart', JSON.stringify(state));
      return state;
    },
    decreaseItemQuantity: (state, action) => {
      const { id, location_id } = action.payload;
      const hold = findOrCreateHold(state, location_id);
      const existingItem = hold.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity -= 1;
        if (existingItem.quantity === 0) {
          hold.items = hold.items.filter((item) => item.id !== id);
        }
        hold.totalSell -= +action.payload.sell_price;
        hold.totalCost -= +action.payload.cost_price;
        localStorage.setItem('holdCart', JSON.stringify(state));
      }
    },
  },
});

export default holdSlice.reducer;
export const selectHold = (state: any) => state.hold;
export const selectHoldByLocation = (location_id: string | number) =>
  createSelector(
    selectHold,
    (holdState) =>
      (!!holdState.length
        ? holdState?.find((hold: IHold) => +hold.location_id === +location_id)
        : null) as IHold
  );

export const {
  addToHold,
  setHold,
  setHoldTax,
  setHoldCustomer,
  setHoldDiscount,
  decreaseItemQuantity,
  clearHold,
  removeFromHold,
} = holdSlice.actions;
