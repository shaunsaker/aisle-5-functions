import { ShopProduct, Unit } from '../models';
import { getUuid } from '../utils/getUuid';

export const makeShopProduct = ({
  categoryId = '',
  displayName = '',
  id,
  price = 0,
  quantityUnit = Unit.unit,
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
