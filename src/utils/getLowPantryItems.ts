// TODO: this is the same code as aisle-5
import moment = require('moment');
import {
  PantryItem,
  ProductId,
  ShoppingListItem,
  ShoppingLists,
} from '../models';
import { numberToDigits } from './numberToDigits';
import { objectToArray } from './objectToArray';
import { sortArrayOfObjectsByKey } from './sortArrayOfObjectsByKey';

interface ProductsOrders {
  [key: ProductId]: {
    id: ProductId;
    orders: ShoppingListItem[];
  };
}

const getProductsOrders = (shoppingLists: ShoppingLists): ProductsOrders => {
  const productOrders: ProductsOrders = {};

  objectToArray(shoppingLists).forEach((shoppingList) => {
    if (!shoppingList.active) {
      objectToArray(shoppingList.items).forEach((shoppingListItem) => {
        const productId = shoppingListItem.productId;

        if (!productOrders[productId]) {
          productOrders[productId] = {
            id: productId,
            orders: [shoppingListItem],
          };
        } else {
          // if an order was made on the same day of another, group it
          const existingOrders = productOrders[productId].orders;
          const existingOrderIndexIfSameDay = existingOrders.findIndex(
            (order) =>
              moment(order.dateAdded).isSame(
                shoppingList.dateCheckedOut,
                'day',
              ),
          );

          if (existingOrderIndexIfSameDay > -1) {
            const existingOrder = existingOrders[existingOrderIndexIfSameDay];
            const updatedOrder: typeof existingOrder = {
              ...existingOrder,
              quantity: (existingOrder.quantity += shoppingListItem.quantity),
              dateAdded: shoppingListItem.dateAdded,
            };

            productOrders[productId].orders[existingOrderIndexIfSameDay] =
              updatedOrder;
          } else {
            productOrders[productId].orders.push(shoppingListItem);
          }
        }
      });
    }
  });

  // sort each list of orders
  Object.keys(productOrders).forEach((productId) => {
    const sortedOrders = sortArrayOfObjectsByKey(
      productOrders[productId].orders,
      'dateAdded',
    );

    productOrders[productId].orders = sortedOrders;
  });

  return productOrders;
};

const getTotalQuantityFromOrders = (orders: ShoppingListItem[]): number => {
  const totalQuantity = orders.reduce((total, shoppingListItem) => {
    return (total += shoppingListItem.quantity);
  }, 0);

  return totalQuantity;
};

const getUsagePerDayFromOrders = (orders: ShoppingListItem[]): number => {
  // we need at least two orders to calculate usage
  if (orders.length < 2) {
    return 0;
  }

  const totalQuantity = getTotalQuantityFromOrders(orders);

  // don't add the last order's quantity because we don't know if that is finished yet
  const lastOrder = orders[orders.length - 1];
  const quantityToUse = totalQuantity - lastOrder.quantity;

  const firstOrder = orders[0];
  const totalTime = moment(lastOrder.dateAdded).diff(
    firstOrder.dateAdded,
    'days',
  );
  const averageUsage = numberToDigits(quantityToUse / totalTime, 2);

  return averageUsage;
};

interface ProductsUsages {
  [key: ProductId]: number; // quantity per day
}

const getPantryProductsAverageUsage = (
  productOrders: ProductsOrders,
): ProductsUsages => {
  const productUsages: ProductsUsages = {};
  const productOrdersArray = objectToArray(productOrders);

  productOrdersArray.forEach((productOrder) => {
    const averageUsage = getUsagePerDayFromOrders(productOrder.orders);
    const productId = productOrder.orders[0].productId;

    productUsages[productId] = averageUsage;
  });

  return productUsages;
};

const getDaysLeftFromOrders = (
  orders: ShoppingListItem[],
  usagePerDay: number,
): number | null => {
  if (!usagePerDay || !orders.length) {
    return null;
  }

  // NOTE: we assume that when we order more of an item, our pantry stock is finished
  // E.g. I last ordered 10 potatoes, 3 days ago, I use 2 potatoes per day
  const lastOrder = orders[orders.length - 1];
  const lastOrderQuantity = lastOrder.quantity;
  const daysSinceLastOrder = moment().diff(lastOrder.dateAdded, 'days');
  const quantityLeft = lastOrderQuantity - usagePerDay * daysSinceLastOrder;
  const daysLeft = quantityLeft / usagePerDay;

  if (daysLeft < 0) {
    return 0;
  }

  return daysLeft;
};

const getProductsDaysLeft = (
  productOrders: ProductsOrders,
  productUsages: ProductsUsages,
): PantryItem[] => {
  const pantryItems: PantryItem[] = [];

  Object.keys(productOrders).forEach((productId) => {
    const productOrder = productOrders[productId];
    const usagePerDay = productUsages[productId];
    const daysLeft = getDaysLeftFromOrders(productOrder.orders, usagePerDay);

    const pantryItem: PantryItem = {
      productId,
      daysLeft,
      usagePerDay,
    };

    pantryItems.push(pantryItem);
  });

  const sortedPantryItems = sortArrayOfObjectsByKey(pantryItems, 'daysLeft');

  return sortedPantryItems;
};

const getPantryItemsFromShoppingLists = (
  shoppingLists: ShoppingLists,
): PantryItem[] => {
  const productOrders = getProductsOrders(shoppingLists);

  const productUsages = getPantryProductsAverageUsage(productOrders);

  const pantryItems = getProductsDaysLeft(productOrders, productUsages);

  // only include the products we have enough data on
  const filteredPantryItems = pantryItems.filter(
    (item) => item.daysLeft === null,
  );

  return filteredPantryItems;
};

export const getLowPantryItems = (
  shoppingLists: ShoppingLists,
  lowPantryItemThreshold: number,
): PantryItem[] => {
  const pantryItems = getPantryItemsFromShoppingLists(shoppingLists);
  const lowPantryItems = pantryItems.filter(
    (pantryItem) =>
      pantryItem.daysLeft && pantryItem.daysLeft <= lowPantryItemThreshold,
  );

  return lowPantryItems;
};
