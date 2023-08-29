import { IUserBusiness } from '@models/auth.types';
import { ICurrency } from '@models/business.types';
import { type ICustomResponse } from '@models/global.types';
import { type AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';
import api from 'src/utils/app-api';
import { authApi } from 'src/utils/auth-api';
import useSWR, { type SWRConfiguration } from 'swr';
type TServiceResponse<T> = AxiosResponse<ICustomResponse<T>>;

interface ICreateBusinessLocationPayload {
  name: string;
  state: string;
  currency_id: number | string;
  decimal: number;
  business_id: number | string;
}

const businessService = {
  getBusinesses: async (id?: string) => {
    {
      const session = await getSession();

      return (await authApi(session))
        .get<any, TServiceResponse<IUserBusiness[]>, any>('/business' + (id ? `/${id}` : ''))
        .then((data) => data.data);
    }
  },
  updateBusinessSettings: async (id, payload: { [x: string]: any }) => {
    const session = await getSession();

    return (await authApi(session))
      .put<any, TServiceResponse<IUserBusiness[]>, any>(
        `/business/${id}`,
        {},
        {
          params: { ...payload },
        }
      )
      .then((data) => data.data);
  },
  getLocationSettings: async (id) => {
    const session = await getSession();

    return (await authApi(session))
      .get<any, TServiceResponse<IUserBusiness[]>, any>(`/business/locations/${id}`)
      .then((data) => data.data);
  },

  updateLocationSettings: async (id, payload: { [x: string]: any }) => {
    const session = await getSession();

    return (await authApi(session))
      .put<any, TServiceResponse<IUserBusiness[]>, any>(
        `/business/locations/${id}`,
        {},
        {
          params: { ...payload },
        }
      )
      .then((data) => data.data);
  },

  listBusinessTypes: async () => {
    const session = await getSession();

    return (await authApi(session))
      .get<any, TServiceResponse<IUserBusiness[]>, any>('/business/types')
      .then((data) => data.data);
  },

  listBusinessLocations: async (params: { [x: string]: any }) => {
    const session = await getSession();

    return (await authApi(session))
      .get<any, TServiceResponse<IUserBusiness[]>, any>('/business/locations', {
        params,
      })
      .then((data) => data.data);
  },

  createBusinessLocation: async (payload: ICreateBusinessLocationPayload) => {
    const session = await getSession();
    return (await authApi(session))
      .post('/business/locations', {
        ...payload,
      })
      .then((data) => data.data);
  },

  listCurrencies: async (params: { [x: string]: any }) => {
    const session = await getSession();

    return (await authApi(session))
      .get<any, TServiceResponse<ICurrency[]>, any>('/currencies', {
        params,
      })
      .then((data) => data.data);
  },
};

export const useBusinessList = (config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : '/business',
    businessService.getBusinesses,
    {
      ...config,
    }
  );

  return {
    businessList: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};
export const useGetBusiness = (id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/business/${id}`, // Adjust the API endpoint according to your needs
    () => businessService.getBusinesses(id), // Adjust the data fetching function
    {
      ...config,
    }
  );

  return {
    business: (data?.result?.[0] ?? {}) as IUserBusiness, //this for the data of only one business
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useCurrenciesList = (params?: { [x: string]: any }, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : ['/currencies', params],
    () => businessService.listCurrencies(params),
    {
      ...config,
    }
  );

  return {
    currenciesList: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useBusinessTypesList = (config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : '/business/types',
    businessService.listBusinessTypes,
    {
      ...config,
    }
  );

  return {
    businessTypesList: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useBusinessLocations = (params?: { [x: string]: any }, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : ['/business/locations', params],
    () => businessService.listBusinessLocations(params),
    {
      ...config,
    }
  );

  return {
    businessLocations: data?.result ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
};

export const useGetBusinessLocation = (id: string, config?: SWRConfiguration) => {
  const { data, error, isLoading, mutate } = useSWR(
    config?.suspense ? null : `/business/locations/${id}`, // Adjust the API endpoint according to your needs
    () => businessService.getLocationSettings(id), // Adjust the data fetching function
    {
      ...config,
    }
  );

  return {
    businessLocation: (data?.result ?? {}) as IUserBusiness, //this for the data of only one business
    isLoading,
    error,
    refetch: mutate,
  };
};

export default businessService;
