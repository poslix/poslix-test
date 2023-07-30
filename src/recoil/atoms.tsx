import { atom } from "recoil";
import { IproductInfo, IjobType } from "../models/common-model";
class StateManager { }
export class RecoilAtom extends StateManager { }


//----------------------------------------------------------------
const productObject: any = {
  product_tax: 0,
  brand_tax: 0,
  cat_tax: 0,
  def_tax: false
};
const jobType: IjobType = {};
export const productDetails = atom({
  key: 'product-info',
  default: productObject,
});
//----------------------------------------------------------------


//----------------------------------------------------------------
export const tabSelected = atom({
  key: 'tab-selected',
  default: "category",
});
//----------------------------------------------------------------

//----------------------------------------------------------------
export const clearOrders = atom({
  key: 'clear-orders',
  default: 1
});
//----------------------------------------------------------------
export const cartJobType = atom({
  key: 'cart-jobtype',
  default: jobType
});
//----------------------------------------------------------------

//----------------------------------------------------------------
export const customerOrders = atom({
  key: 'customer-orders',
  default: []
});
//----------------------------------------------------------------


//----------------------------------------------------------------
export const productSpinner = atom({
  key: 'product-spinner',
  default: false
});
//----------------------------------------------------------------
