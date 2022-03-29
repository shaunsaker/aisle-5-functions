import { firebase } from '.';
import { ShoppingList } from '../../models';

export const firebaseCreateShoppingList = (
  shoppingList: Omit<ShoppingList, 'id'>,
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      await firebase.firestore().collection('shoppingLists').add(shoppingList);
    } catch (error) {
      reject(error);
    }
  });
};
