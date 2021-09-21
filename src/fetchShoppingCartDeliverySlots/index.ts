import * as functions from 'firebase-functions';
import { CallableContext } from 'firebase-functions/v1/https';
import moment = require('moment');
import { FirebaseCallableFunctionsResponse } from '../firebase/models';
import { ShopIds, ShoppingCartDeliverySlots } from '../models';
import { woolworthsFetchDeliverySlots } from '../woolworths/woolworthsFetchDeliverySlots';

type Response = FirebaseCallableFunctionsResponse<ShoppingCartDeliverySlots>;

const fetchDeliverySlotsForShop = async (
  uid: string | undefined,
  shopId: ShopIds | undefined,
): Promise<Response> => {
  if (!uid) {
    return {
      error: true,
      message: 'User is not signed in.',
      data: undefined,
    };
  }

  if (!shopId) {
    return {
      error: true,
      message: 'Please provide a shop id.',
      data: undefined,
    };
  }

  if (shopId === ShopIds.Woolworths) {
    try {
      const woolworthsFetchDeliverySlotsResponse =
        await woolworthsFetchDeliverySlots();
      const shoppingCartDeliverySlots: ShoppingCartDeliverySlots = {};

      woolworthsFetchDeliverySlotsResponse.sortedJoinDeliverySlots.forEach(
        (group) => {
          group.data.forEach((item) => {
            item.forEach((deliverySlot) => {
              if (deliverySlot) {
                const slotId = deliverySlot.slotId;

                if (slotId && !shoppingCartDeliverySlots[slotId]) {
                  shoppingCartDeliverySlots[slotId] = {
                    id: slotId,
                    timeFrom: moment(deliverySlot.shipOnDate)
                      .add({ hours: deliverySlot.intHourFrom })
                      .toISOString(),
                    timeTo: moment(deliverySlot.shipOnDate)
                      .add({ hours: deliverySlot.intHourTo })
                      .toISOString(),
                  };
                }
              }
            });
          });
        },
      );

      return {
        error: false,
        message: '',
        data: shoppingCartDeliverySlots,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.log({ error });
        return {
          error: true,
          message: error.message,
          data: undefined,
        };
      }
    }
  }

  return {
    error: true,
    message: 'Something went wrong.',
    data: undefined,
  };
};

const fetchShoppingCartDeliverySlots = functions.https.onCall(
  async (
    data: { shopId: ShopIds },
    context: CallableContext,
  ): Promise<Response> => {
    const uid = context.auth?.uid;
    const response = await fetchDeliverySlotsForShop(uid, data.shopId);

    return response;
  },
);

// const doAsync = async () => {
//   const response = await fetchDeliverySlotsForShop(
//     process.argv[2],
//     process.argv[3] as ShopIds | undefined,
//   );
//   console.log(JSON.stringify({ response }, undefined, 2));
// };

// doAsync();

export { fetchShoppingCartDeliverySlots };
