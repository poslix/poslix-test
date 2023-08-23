export interface ILogin {
  user: IUser;
  authorization: {
    token: string;
    type: string;
  };
}

export interface IUser {
  id: number;
  owner_id?: string | number;

  username: string;
  user_type: 'owner' | 'user';
  first_name: string;
  last_name?: string;
  contact_number: string;
  email: string;

  status: string; //needs to be changed to enum

  deleted_at: any;
  created_at: any;
  updated_at: any;

  token?: string;
}

export interface IUserBusiness {
  id: string | number;
  type: string;
  type_id: number;
  name: string;
  email?: string;
  locations: ILocation[];
}

export interface ILocation {
  location_id: number;
  location_name: string;
  location_decimal_places: number;
  currency_id: number;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
}
