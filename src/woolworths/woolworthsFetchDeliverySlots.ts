import axios from 'axios';
import {
  defaultWoolworthsAxiosConfig,
  woolworthsApi,
  WoolworthsEndpoints,
} from './models';
import { woolworthsLogin } from './woolworthsLogin';

export interface WoolworthsDeliverySlot {
  slotId: string;
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
