import axios from 'axios';
import {
  defaultWoolworthsAxiosConfig,
  woolworthsApi,
  WoolworthsEndpoints,
} from './models';

export const woolworthsLogin = async (): Promise<void> => {
  try {
    const response = await axios.post(
      `${woolworthsApi}/${WoolworthsEndpoints.login}`,
      {
        login: 'sakershaun@gmail.com', // TODO: move to env file
        password: 'sakerhouse19',
      },
      {
        ...defaultWoolworthsAxiosConfig,
      },
    );

    // store the cookie and reuse it in subsequent requests
    axios.defaults.headers.cookie = response.headers['set-cookie'];

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
