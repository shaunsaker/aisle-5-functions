import { firebase } from '.';
import { ShoppingList } from '../../models';

export const firebaseFetchActiveShoppingList = async (
  uid: string,
): Promise<ShoppingList> => {
  return new Promise(async (resolve, reject) => {
    try {
      const shoppingLists = (
        await firebase
          .firestore()
          .collection('shoppingLists')
          .where('createdByUid', '==', uid)
          .where('active', '==', true)
          .get()
      ).docs.map((doc) => ({ id: doc.id, ...doc.data() } as ShoppingList));

      const activeShoppingList = shoppingLists[0];

      resolve(activeShoppingList);
    } catch (error) {
      reject(error);
    }
  });
};
