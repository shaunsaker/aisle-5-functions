import axios from 'axios';
import {
  defaultWoolworthsAxiosConfig,
  woolworthsApi,
  WoolworthsEndpoints,
} from './models';
import { woolworthsLogin } from './woolworthsLogin';
import { woolworthsLogout } from './woolworthsLogout';

export interface WoolworthsDeliverySlot {
  slotId: string;
  slotCost: number;
  shipOnDate: number;
  intHourFrom: number;
  intHourTo: number;
}

export interface WoolworthsDeliverySlotsResponse {
  sortedJoinDeliverySlots: {
    data: WoolworthsDeliverySlot[][];
  }[];
}

export const woolworthsFetchDeliverySlots =
  async (): Promise<WoolworthsDeliverySlotsResponse> => {
    try {
      const hasAuthCookie = axios.defaults.headers.cookie;

      if (hasAuthCookie) {
        // logout to clear any cookies
        try {
          await woolworthsLogout();
        } catch (error) {
          // continue if there is an error
          console.log({ error });
        }
      }

      await woolworthsLogin();

      console.log('Logged in successfully.');

      const response = await axios.get(
        `${woolworthsApi}/${WoolworthsEndpoints.deliverySlots}`,
        {
          ...defaultWoolworthsAxiosConfig,
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }

    throw new Error('Something went wrong');
  };
