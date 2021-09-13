import { firebase } from '.';
import { ShopId, ShopProduct, ShopProductId } from '../models';

export const firebaseFetchShopProduct = async (
  shopId: ShopId,
  shopProductId: ShopProductId,
): Promise<ShopProduct> => {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshot = await firebase
        .firestore()
        .collection('shops')
        .doc(shopId)
        .collection('products')
        .doc(shopProductId)
        .get();
      const data = {
        id: snapshot.id,
        ...snapshot.data(),
      } as ShopProduct;

      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};
