import {
  COMMISSION_FACTOR,
  ShopProductWithQuantityToOrder,
} from '../../models';

export const getCommission = (
  basePrice: number,
  commissionFactor: number,
): number => {
  if (basePrice === 0) {
    return 0;
  }

  // add the commission and round up to the nearest X.99
  const priceWithCommission = basePrice * (1 + commissionFactor);
  const rounded = Math.ceil(priceWithCommission);
  const nearest99 = rounded - 0.01;

  return nearest99;
};

export const attachCommissionToShopProducts = (
  items: ShopProductWithQuantityToOrder[],
): ShopProductWithQuantityToOrder[] => {
  return items.map((item) => ({
    ...item,
    price: getCommission(item.price, COMMISSION_FACTOR),
  }));
};
