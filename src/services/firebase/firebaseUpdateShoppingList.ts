import { firebase } from '.';
import { ShoppingList, ShoppingListId } from '../../models';

export const firebaseUpdateShoppingList = ({
  shoppingListId,
  shoppingList,
}: {
  shoppingListId: ShoppingListId;
  shoppingList: Partial<ShoppingList>;
}): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      await firebase
        .firestore()
        .collection('shoppingLists')
        .doc(shoppingListId)
        .update(shoppingList);

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
