import { firebase } from '.';
import { Shop, Shops } from '../../models';

export const firebaseFetchShops = async (): Promise<Shops> => {
  return new Promise(async (resolve, reject) => {
    try {
      const shopsArray = (
        await firebase.firestore().collection('shops').get()
      ).docs.map((doc) => ({ id: doc.id, ...doc.data() } as Shop));

      resolve(shopsArray);
    } catch (error) {
      reject(error);
    }
  });
};
