export class CommonModels {}

export interface IproductInfo {
  transaction_id?: number;
  product_id?: number;
  name?: string;
  nameSecond?: string;
  description?: string;
  image?: string;
  price?: number;
  cost?: number;
  product_price?: number;
  qty?: number;
  total_qty: number;
  quantity?: number;
  quantity2?: number;
  index?: number;
  never_tax: number;
  product_tax: number;
  brand_tax: number;
  category_tax: number;
  def_tax: boolean;
  is_service?: boolean;
  isEdit?: boolean;
  sell_over_stock?: boolean;
  items: IproductInfo | any;
  variation_id?: number;
  variation_price?: number;
  type: string;
  is_tailoring?: number;
  is_fabric?: number;
}
export interface ITailoringCustom {
  fabric_length: number;
  fabric_id?: number;
  multiple?: number;
  prices?: object[];
  stock_ids?: object[];
  notes: string;
  extras: string;
}
export interface IQuantity {
  freezeQuantity: number;
  freezeTaxAmount?: number;
  freezeTailoringCutsom?: ITailoringCustom;
  quantity: number;
  productIndex: number;
  itemIndex: number;
  prices: IQuantityPricess[];
  lineTotalPrice: number;
  taxAmount: number;
  tailoring?: string;
  tailoringName?: string;
  tailoringIsEdit?: number;
  selectionColor?: number;
  tailoringCutsom?: ITailoringCustom;
}
export type IpurchaseProductItem = {
  id?: number;
  product_id: number;
  variation_id: number;
  product?: string;
  name: string;
  cost: number;
  convertd_cost?: number;
  price: number;
  quantity: number;
  lineTotal: number;
  taxAmount: number;
  notifyExpensePrice?: number;
  notifyTaxPrice?: number;
  notifyTotalPrice?: number;
  vat?: number;
  costType: number;
  trans_id?: number;
  isNew: boolean;
};
//isCost 0 => cost 1 => withExpends  2=> withTax 3=>sumAll
export interface ITax {
  id: number;
  name: string;
  amount: number;
  amountType: string;
  taxType: string;
  isPrimary: boolean;
  parentId?: number;
  isNew?: number;
  isChoosed?: boolean;
  isSplit?: boolean;
}
export interface IreadyGroupTax {
  primary: number;
  nonPrimary: number;
  excises: number;
  serviesFixed: number;
  servicesPercentage: number;
}
export interface ItypeSelected {
  isBrandSelected?: boolean;
  isCategorySelected?: boolean;
}
export interface IQuantityPricess {
  stock_id: number;
  qty: number;
  price: number;
  cost: number;
  packs?: any[];
}

export interface HoldFields {
  customer?: string;
  price?: number;
  action?: string;
}

export interface IpaymentRow {
  total?: number;
  totalDue?: number;
  return?: number;
  amount: number;
  method: string;
  notes: string;
  index?: number;
  key?: any;
}
export interface IOrderMiniDetails {
  isEdit: boolean;
  name: string;
  total_price: number;
  orderId: number;
  notes?: string;
}

export type DiscountType = "fixed" | "percent";
export type Discount = {
  type: DiscountType;
  amount: number;
};

export interface IOrdersCalcs {
  taxRate: number;
  totalAmount: number;
  shippingRate: number;
  subTotal: number;
  orderEditDetails: IOrderMiniDetails;

  // with discount feature
  tax?: number;
  totalDiscount?: number;
  setDiscount?: (discount: Discount) => void;
  __WithDiscountFeature__total?: number;
  lang?: any
}

export interface IVariation {
  name: string;
  name2: string;
  cost: number;
  price: number;
  qty: number;
}
export interface InewCustomer {
  type: number;
  groupName: string;
  email: string;
  mobile: number;
  altMobile: number;
  taxNumber: number;
  openBalance: number;
  payTeam: string;
  creditLimit: number;
  addressLineOne: string;
  addressLineTwo: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  shippingAddress: string;
}
export interface Icustom {
  isPackage?: boolean;
  price?: number;
  fabric_id?: number;
  multiple?: number;
  fabric_length?: number;
  notes: string;
  extras: string;
}
export interface IjobType {
  req?: number;
  val?: string;
  val2?: string;
  val3?: number;
  custom?: Icustom;
}
export interface ITokenUserInfo {
  id: string;
  oid?: number | string;
  name: string;
  locs?: object[];
  types?: object[];
  rules?: object[];
  level?: string;
}
export interface ITokenVerfy {
  status: boolean;
  data: ITokenUserInfo;
}
export interface IDataLogin {
  id: string;
  oid?: string;
  level?: string;
  locs?: object[];
  types?: object[];
  rules: object[];
}
export type Data = {
  success: boolean;
  msg: string;
  newdata?: Object;
  data?: Object;
  code?: number;
  userObject?: userDashboard;
};
export type userDashboard = {
  isNew?: boolean;
  id?: number;
  name: string;
  username: string;
  password: string;
  mobile: string;
  email: string;
};
export interface IRoles {
  id: number;
  name: string;
  stuff: string;
}
export interface IPageRules {
  hasEdit: boolean;
  hasDelete: boolean;
  hasView: boolean;
  hasInsert: boolean;
}
export type IsaleProductItem = {
  id: number;
  product: string;
  cost: number;
  price: number;
  quantity: number;
  product_tax: number;
  brand_tax: number;
  cat_tax: number;
  def_tax: boolean;
};
export interface ILocationSettings {
  value: number;
  label: string;
  currency_id: number;
  currency_code: string;
  currency_decimal_places: number;
  currency_rate: number;
  currency_symbol: string;
}
export interface IPurchaseExpndes {
  label: string;
  value: number;
  enterd_value: number;
  currency_id: number;
  currency_code: string;
  currency_rate: number;
  converted_value: number;
  isNew: boolean;
}
export interface IPayment {
  id: number;
  payment_type: string;
  amount: number;
  created_at: string;
}
export interface IExpenseList {
  id: number;
  name: string;
  amount: number;
  cate_name?: string;
  expense_id: number;
  date: Date;
}
export interface IinvoiceDetails {
  logo: string;
  name: string;
  tell: string;
  date: Date;
  footer: string;
  footersecond: string;
  footer2?: string;
  isMultiLang: boolean;
  orderNo: string;
  orderNo2?: string;
  txtDate: string;
  txtDate2?: string;
  txtQty: string;
  txtQty2?: string;
  txtItem: string;
  txtItem2?: string;
  txtAmount: string;
  txtAmount2?: string;
  txtTax: string;
  txtDiscount: string;
  txtTotal: string;
  txtTax2?: string;
  txtDiscount2?: string;
  txtTotal2?: string;
  txtAmountpaid: string;
  txtAmountpaid2: string;
  txtTotalDue: string;
  txtTotalDue2: string;
  txtCustomer: string;
  txtCustomer2?: string;
}

export interface IPackItem {
  parent_id: number;
  product_id: number;
  price: number;
}
export interface ITailoringPackagePrice {
  name: string;
  name2: string;
  from: number;
  to: number;
  price: number;
}
export interface ITailoringExtra {
  id: number;
  name: string;
  isRequired: boolean;
  items: string;
  tailoring_type_id: number;
}
export interface ITailoringExtraItems {
  name: string;
}
export interface IHold {
  name: string;
  data: string;
  length: number;
  location_id: number;
}
export interface IHoldItems {
  type: string;
  product_id: number;
  variation_id: number;
  qty: number;
  data: string;
  tailoring?: string;
  tailoringName?: string;
  tailoringIsEdit?: number;
  tailoringCutsom?: ITailoringCustom;
}
