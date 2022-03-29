import * as functions from 'firebase-functions';
import { firebaseCreateShoppingList } from '../firebase/firebaseCreateShoppingList';
import { firebaseFetchShoppingLists } from '../firebase/firebaseFetchShoppingLists';
import { firebaseFetchUsers } from '../firebase/firebaseFetchUsers';
import { firebaseSendNotification } from '../firebase/firebaseSendNotification';
import { firebaseUpdateShoppingList } from '../firebase/firebaseUpdateShoppingList';
import { ShoppingListItem, ShoppingListItems } from '../models';
import { arrayToObject } from '../utils/arrayToObject';
import { getLowPantryItems } from '../utils/getLowPantryItems';
import { getTimeAsISOString } from '../utils/getTimeAsISOString';
import { objectToArray } from '../utils/objectToArray';

// FIXME: some of this logic is shared with the mobile app
// we could let the backend handle the logic by creating a new endpoint
const listAutoUpdateAndNotify = functions.pubsub
  .schedule('0 8 * * *') // every day at 08h00
  .timeZone('Africa/Johannesburg')
  .onRun(async (): Promise<void> => {
    const users = await firebaseFetchUsers();

    for (const userId in users) {
      const userData = users[userId];

      if (
        userData.settingsListAutoUpdate ||
        userData.settingsNotifyLowPantryItems
      ) {
        const shoppingLists = await firebaseFetchShoppingLists(userId);

        const lowPantryItems = getLowPantryItems(
          shoppingLists,
          userData.settingsPantryItemLowStatusThreshold,
        );

        const shoppingListItems: ShoppingListItems = arrayToObject(
          lowPantryItems
            .filter((pantryItem) => pantryItem)
            .map((pantryItem) => {
              const shoppingListItem: ShoppingListItem = {
                productId: pantryItem.productId,
                // FIXME: we may want to calculate quantity based on order rate
                quantity:
                  // @ts-expect-error usagePerDay is not null
                  pantryItem.usagePerDay *
                  userData.settingsPantryItemLowStatusThreshold,
                dateAdded: getTimeAsISOString(),
              };

              return shoppingListItem;
            }),
        );

        const activeShoppingList = objectToArray(shoppingLists).find(
          (shoppingList) => shoppingList.active,
        );

        if (!activeShoppingList) {
          // if the user does not have an active shopping list, create one

          await firebaseCreateShoppingList({
            items: shoppingListItems,
            active: true,
            members: [],
            createdByUid: '',
            createdByUsername: '',
            dateCreated: getTimeAsISOString(),
          });
        } else {
          // update the existing shopping list
          const newShoppingListItems = {
            ...activeShoppingList.items,
            ...shoppingListItems,
          };

          await firebaseUpdateShoppingList({
            shoppingListId: activeShoppingList.id,
            shoppingList: {
              items: newShoppingListItems,
            },
          });
        }

        const userHasRegisteredForNotifications = userData.fcmToken;
        const shouldNotifyUserToPlaceNewOrder =
          userData.settingsNotifyLowPantryItems &&
          lowPantryItems.length >= userData.settingsNotifyLowPantryItemCount;

        if (
          userHasRegisteredForNotifications &&
          shouldNotifyUserToPlaceNewOrder
        ) {
          // notify the user to place a new order
          await firebaseSendNotification({
            title: `You're running low on ${lowPantryItems.length} groceries!`,
            body: 'Tap this notification to place an order with Aisle 5 🚛',
            token: userData.fcmToken,
          });
        }
      }
    }

    return;
  });

export { listAutoUpdateAndNotify };
