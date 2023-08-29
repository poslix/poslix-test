export interface ICurrency {
  id: number;
  country: string;
  currency: string;
  code: string;
  symbol: string;
  thousand_separator: string;
  decimal_separator: string;
  exchange_rate: string;
  created_at: any;
  updated_at: any;
}

export interface IBusinessLocationCreated {
  id: number;
  owner_id: number;
  business_id: string;
  currency_id: string;
  state: string;

  name: string;
  decimal_places: string;

  updated_at: string;
  created_at: string;
}
