import { ShopProduct } from '../models';
import { getUuid } from '../utils/getUuid';

export const makeShopProduct = ({
  categoryId = '',
  displayName = '',
  id,
  price = 0,
  quantityUnit = 'unit',
  quantityValue = 0,
}: Partial<ShopProduct>): ShopProduct => {
  return {
    categoryId,
    displayName,
    id: id || getUuid(),
    price,
    quantityUnit,
    quantityValue,
  };
};
