import { firebase } from '.';
import { ShoppingList, ShoppingListId } from '../../models';

type FirebaseFetchActiveShoppingListResponse = Record<
  ShoppingListId,
  ShoppingList
>;

export const firebaseFetchShoppingLists = async (
  uid: string,
): Promise<FirebaseFetchActiveShoppingListResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const shoppingLists: FirebaseFetchActiveShoppingListResponse = {};

      (
        await firebase
          .firestore()
          .collection('shoppingLists')
          .where('members', 'array-contains', uid)
          .get()
      ).docs.forEach((doc) => {
        shoppingLists[doc.id] = doc.data() as ShoppingList;
      });

      resolve(shoppingLists);
    } catch (error) {
      reject(error);
    }
  });
};
