export interface IPricesJson {
  name: string;
  from: string | number;
  to: string | number;
  price: string | number;
}

export interface ICategory {
  id: number;
  name: string;
  location_id: number;
  short_code?: any;
  parent_id: number;
  created_by: number;
  woocommerce_cat_id?: any;
  category_type?: any;
  description: string;
  slug?: any;
  tax_id?: any;
  never_tax: number;
  deleted_at?: any;
  created_at?: any;
  updated_at?: any;
  show_in_list: string;
  products_count: number;
  products: IProduct[];
}

export interface IProduct {
  id: number;
  name: string;
  business_id?: number;
  location_id: number;
  type: 'single' | 'variable';
  is_tailoring: number;
  is_service: 0 | 1 | boolean;
  is_fabric: 0 | 1 | boolean;
  subproductname: string;
  unit_id: number;
  brand_id: number;
  category_id: number;
  sub_category_id?: any;
  tax?: any;
  never_tax: 1 | 0 | boolean;
  alert_quantity: string;
  sku: string;
  barcode_type: string;
  image: string;
  product_description?: string;
  created_by: number;
  is_disabled: number;
  sell_price: string | number;
  cost_price: string | number;
  sell_over_stock: string;
  qty_over_sold: string;
  created_at?: string;
  updated_at?: string;
  is_selling_multi_price: number;
  is_fifo: number;
  status: string;
  stock: number;
  variations?: IVariation[];
  packages: IPackage[];
  stocks: IStock[];
  category: ICategory;
}
export interface IVariation {
  id: number;
  location_id: number;
  parent_id: number;
  name: string;
  name2: string;
  sku: string;
  cost: string;
  price: string;
  sell_over_stock: number;
  is_selling_multi_price: number;
  is_service: 0 | 1 | boolean;
  is_active: number;
  created_by: number;
  created_at?: string;
  stock: number;
  stocks: IStock[];
}
export interface IPackage {
  id: number;
  location_id: number;
  parent_id: number;
  tailoring_type_id: number;
  prices_json: IPricesJson[];
  fabric_ids: string;
  product_ids?: any;
  created_by: number;
  created_at?: any;
}

export interface ICustomer {
  id: number;
  location_id: number;
  type: string;
  first_name: string;
  last_name: string;
  name?: string;
  email?: string;
  contact_id?: string | number;
  contact_status: string;
  city?: string;
  state?: string;
  country?: string;
  address_line_1?: string;
  address_line_2?: string;
  zip_code?: string;
  mobile: string | number;
  created_by: number;
  shipping_address?: string;
  deleted_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface IPackageType {
  id: number;
  name: string;
  location_id: number;
  created_by: number;
  created_at: string | null;
  multiple_value: string;
  extras: string;
}

export interface IUnit {
  id: number;
  type: string;
  name: string;
  unit: string;
  created_at?: any;
}

export interface IUnits {
  units: IUnit[];
}

export interface IBrand {
  id: number;
  location_id: number;
  name: string;
  description: string;
  created_by: number;
  tax_id?: any;
  never_tax: number;
  deleted_at?: any;
  created_at?: any;
  updated_at?: any;
  use_for_repair?: any;
  products_count: number;
  products: IProduct[];
}

export interface ITax {
  id: number;
  location_id: number;
  name: string;
  amount: number;
  is_tax_group: number;
  for_tax_group: number;
  created_by: number;
  woocommerce_tax_rate_id?: any;
  deleted_at?: any;
  created_at?: any;
  updated_at?: any;
  for_tax_inclusive: number;
  for_tax_exclusive: number;
  is_inc_or_exc: string;
  type: 'percentage' | 'fixed';
  is_primary: boolean | 0 | 1;
  tax_type: string;
  tax_group: ITaxGroup[];

  isNew?: number; // this is not existed but to ignore errors
}

export interface ITaxGroup {
  id: number;
  location_id: number;
  name: string;
  amount: number;
  is_tax_group: number;
  for_tax_group: number;
  created_by: number;
  woocommerce_tax_rate_id?: any;
  deleted_at?: any;
  created_at?: any;
  updated_at?: any;
  for_tax_inclusive: number;
  for_tax_exclusive: number;
  is_inc_or_exc: string;
  type: string;
  is_primary: number;
  tax_type: string;
  pivot: IPivot;
}

export interface IPivot {
  parent_id: number;
  tax_id: number;
}

export interface ITaxes {
  taxes: ITax[];
}

export interface ICurrency {
  id: number;
  country: string;
  currency: string;
  code: string;
  symbol: string;
  thousand_separator: string;
  decimal_separator: string;
  exchange_rate: string;
  created_at?: any;
  updated_at?: any;
}
export interface ICurrency {
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
}

export interface IPurchase {
  id: number;
  location_id: number;
  type: string;
  sub_type?: any;
  status: string;
  sub_status?: any;
  is_quotation: number;
  payment_status: string;
  contact_id: number;
  invoice_no: string;
  ref_no?: any;
  tax_amount: string;
  discount_type: string;
  discount_amount: string;
  notes?: any;
  total_price: string;
  document?: any;
  exchange_rate: string;
  created_by: number;
  created_at: string;
  updated_at?: any;
  total_taxes: string;
  taxes: string;
  currency_id: number;
  products: IProduct[];
  payment: IPayment;
  stocks: IStock[];
}

export interface IPayment {
  id: number;
  transaction_id: number;
  payment_type: string;
  amount: string;
  created_by: number;
  created_at: string;
  notes?: any;
}

export interface IStock {
  id: number;
  transaction_id: number;
  transaction_lines_id: number;
  product_id: number;
  variation_id: number;
  qty_received: string;
  qty_sold: string;
  sold_at: string;
  created_by: number;
  created_at: string;
  updated_at?: any;
}

export interface IExpenseCategory {
  id: number;
  name: string;
  location_id: number;
  active?: any;
}

export interface IExpense {
  id: number;
  location_id: number;
  name: string;
  amount: string | number;
  expense_id: number;
  attach?: string;
  date: string;
  created_by: number;
  created_at: string;
}

export interface IReportData {
  id: number;
  contact_id: number;
  user_name: string;
  contact_name: string;
  contact_mobile: string;
  sub_total: number;
  payed: number;
  due: number;
  discount: string;
  tax: string;
  date: string;
  transaction_status: string;
  payment_status: string;
  payment_method: string;
  type: string;
}

export interface IItemReportData {
  order_id: number;
  user_first_name: string;
  user_last_name: any;
  contact_first_name: string;
  contact_last_name: string;
  contact_mobile: string;
  qty: any;
  price: any;
  cost: any;
  tax: any;
  date: string;
  status: string;
  type: string;
  products: IProduct[];
}
export interface IReport<T> {
  data: T[];

  tax: number;
  total: number;
  cost?: number;
  sub_total: number;
  currency: ICurrency;
}

export type ISalesReport = IReport<IReportData>;
export type IItemsReport = IReport<IItemReportData>;
