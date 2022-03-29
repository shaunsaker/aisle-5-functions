import { firebase } from '.';
import { Product, ProductId } from '../../models';

export const firebaseFetchProduct = async (
  productId: ProductId,
): Promise<Product | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshot = await firebase
        .firestore()
        .collection('products')
        .doc(productId)
        .get();

      if (!snapshot.exists) {
        resolve(null);
      }

      const data = {
        id: snapshot.id,
        ...snapshot.data(),
      } as Product;

      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};
