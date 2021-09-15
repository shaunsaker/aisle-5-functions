import * as functions from 'firebase-functions';
import { CallableContext } from 'firebase-functions/v1/https';
import { firebaseFetchActiveShoppingList } from '../firebase/firebaseFetchActiveShoppingList';
import { firebaseFetchProduct } from '../firebase/firebaseFetchProduct';
import { firebaseFetchShopProduct } from '../firebase/firebaseFetchShopProduct';
import { firebaseFetchShops } from '../firebase/firebaseFetchShops';
import {
  Product,
  ProductId,
  ShopId,
  ShopProduct,
  ShopProductId,
  ShopProductWithQuantityToOrder,
} from '../models';
import { isObjectEmpty } from '../utils/isObjectEmpty';
import { objectToArray } from '../utils/objectToArray';
import { attachCommissionToShopProducts } from './attachCommissionToShopProducts';
import { getShopProductsWithQuantityToOrder } from './getShopProductsWithQuantityToOrder';

interface ResponseData {
  [key: ShopId]: {
    [key: ProductId]: ShopProductWithQuantityToOrder[];
  };
}

interface Response {
  error: boolean;
  message: string;
  data: ResponseData | undefined;
}

// FIXME: this could be made faster by using firestore batches instead of waiting in loops
const fetchShoppingCartPrices = async (
  uid: string | undefined,
): Promise<Response> => {
  if (!uid) {
    return {
      error: true,
      message: 'User is not signed in.',
      data: undefined,
    };
  }

  try {
    // fetch the user's active shopping list
    const shoppingList = await firebaseFetchActiveShoppingList(uid);

    if (!shoppingList) {
      return {
        error: true,
        message: 'No active shopping list.',
        data: undefined,
      };
    }

    if (!shoppingList.items || isObjectEmpty(shoppingList.items)) {
      return {
        error: true,
        message: 'No items in shopping list.',
        data: undefined,
      };
    }

    const shoppingListItemsArray = objectToArray(shoppingList.items);

    // fetch the shops
    const shops = await firebaseFetchShops();

    const responseData: ResponseData = {};

    for await (const shop of shops) {
      const shopId = shop.id;

      responseData[shopId] = {};

      for (const item of shoppingListItemsArray) {
        // fetch the product
        const product = await firebaseFetchProduct(item.productId);

        if (!product) {
          return {
            error: true,
            message: `Product with id, ${item.productId}, does not exist.`,
            data: undefined,
          };
        }

        // a product could have multiple shop ids so we need to choose the one that is most relevant to our quantity
        const shopProductsKey = `${shopId}ProductIds` as keyof Product;
        const shopProductIds = product[shopProductsKey] as ShopProductId[];
        const shopProducts: ShopProduct[] = [];

        // fetch the shop product for each shopProductId
        for (const shopProductId of shopProductIds) {
          const shopProduct = await firebaseFetchShopProduct(
            shopId,
            shopProductId,
          );

          shopProducts.push(shopProduct);
        }

        const shopProductsWithQuantityToOrder =
          getShopProductsWithQuantityToOrder({
            quantityNeeded: item.quantity,
            shopProducts,
          });

        // attach commission to each price
        const shopProductsWithQuantityToOrderAndCommission =
          attachCommissionToShopProducts(shopProductsWithQuantityToOrder);

        responseData[shopId][item.productId] =
          shopProductsWithQuantityToOrderAndCommission;
      }
    }

    return {
      error: false,
      message: '',
      data: responseData,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: true,
        message: error.message,
        data: undefined,
      };
    }
  }

  return {
    error: true,
    message: 'Something went wrong.',
    data: undefined,
  };
};

const fetchShoppingCart = functions.https.onCall(
  async (_, context: CallableContext): Promise<Response> => {
    const uid = context.auth?.uid;

    const response = await fetchShoppingCartPrices(uid);

    return response;
  },
);

// const doAsync = async () => {
//   const response = await fetchShoppingCartPrices(process.argv[2]);
//   console.log(JSON.stringify({ response }, undefined, 2));
// };

// doAsync();

export { fetchShoppingCart };
