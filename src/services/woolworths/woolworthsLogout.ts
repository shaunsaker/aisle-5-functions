import axios from 'axios';
import { woolworthsApi, WoolworthsEndpoints } from './models';

export const woolworthsLogout = async (): Promise<void> => {
  try {
    const response = await axios.post(
      `${woolworthsApi}/${WoolworthsEndpoints.logout}`,
      {
        Referer: 'https://www.woolworths.co.za/dashboard',
      },
    );

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
