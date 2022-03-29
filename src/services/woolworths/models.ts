import { AxiosRequestConfig } from 'axios';

export const woolworthsApi = 'https://www.woolworths.co.za/server';

export const defaultWoolworthsAxiosConfig: AxiosRequestConfig = {
  headers: {
    'Content-Type': 'application/json',
    Referer: 'https://www.woolworths.co.za/check-out/delivery',
  },
  withCredentials: true,
};

export enum WoolworthsEndpoints {
  login = 'login',
  logout = 'logout',
  deliverySlots = 'deliverySlots',
}
