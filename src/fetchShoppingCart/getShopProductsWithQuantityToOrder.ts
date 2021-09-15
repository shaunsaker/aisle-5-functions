import {
  NormalisedShopProduct,
  Quantity,
  ShopProduct,
  ShopProductWithQuantityToOrder,
  Unit,
} from '../models';
import { sortArrayOfObjectsByKey } from '../utils/sortArrayOfObjectsByKey';

// TODO: move this to scraper
export const normaliseShopProduct = (
  shopProduct: ShopProduct,
): NormalisedShopProduct => {
  // normalises the units, ie. g => kg, ml => l, unit => unit, pk => pk
  // and converts the quantityValue accordingly
  const quantityUnit = shopProduct.quantityUnit.toLowerCase();
  const quantityValue = shopProduct.quantityValue;
  let normalisedQuantityUnit = Unit.unit;
  let normalisedQuantityValue = 0;

  if (quantityUnit === 'g') {
    normalisedQuantityUnit = Unit.kg;
    normalisedQuantityValue = quantityValue / 1000;
  }

  if (quantityUnit === 'kg') {
    normalisedQuantityUnit = Unit.kg;
    normalisedQuantityValue = quantityValue;
  }

  if (quantityUnit === 'ml') {
    normalisedQuantityUnit = Unit.lt;
    normalisedQuantityValue = quantityValue / 1000;
  }

  if (quantityUnit === 'l') {
    normalisedQuantityUnit = Unit.lt;
    normalisedQuantityValue = quantityValue;
  }

  if (quantityUnit === 'pk') {
    normalisedQuantityUnit = Unit.pk;
    normalisedQuantityValue = quantityValue;
  }

  if (quantityUnit === 'unit') {
    normalisedQuantityUnit = Unit.unit;
    normalisedQuantityValue = quantityValue;
  }

  return {
    ...shopProduct,
    quantityUnit: normalisedQuantityUnit,
    quantityValue: normalisedQuantityValue,
  };
};

const normaliseShopProducts = (
  shopProducts: ShopProduct[],
): NormalisedShopProduct[] =>
  shopProducts.map((shopProduct) => normaliseShopProduct(shopProduct));

const findBestMatchedShopProduct = (
  quantityNeeded: number,
  shopProducts: NormalisedShopProduct[],
): ShopProductWithQuantityToOrder | null => {
  // ie. choose option with smallest quantity higher or equal to our quantity needed
  // (only if there are no lower items)
  // OR if there aren't shopProducts with higher quantity, choose multiples of shopProducts with highest quantity lower than

  if (!shopProducts.length) {
    return null;
  }

  // sort from highest to lowest
  const sortedOptions = sortArrayOfObjectsByKey<NormalisedShopProduct>(
    shopProducts,
    'quantityValue',
    true,
  );

  const itemsWithLowerQuantity = sortedOptions.filter(
    (option) => option.quantityValue <= quantityNeeded,
  );

  let shopProduct: ShopProductWithQuantityToOrder;
  const defaultQuantityToOrder = 1;

  if (itemsWithLowerQuantity.length) {
    // return the item with the highest quantity that is lower than the quantity needed
    shopProduct = {
      ...itemsWithLowerQuantity[0],
      quantityToOrder: defaultQuantityToOrder,
    };
  } else {
    // return the item with the lowest quantity
    shopProduct = {
      ...sortedOptions.reverse()[0],
      quantityToOrder: defaultQuantityToOrder,
    };
  }

  return shopProduct;
};

// returns the best combination of items relevant to the quantityNeeded
// e.g. I need 10 milks, they come in 1, 3 and 20 packs. Returns 3x3 and 1x1.
// NOTE: we assume the pricePerUnit decreases for bulk items
// NOTE: we assume that the units of the shopProducts are the same
// FIXME: this is quick and dirty function and can definitely be improved
export const getShopProductsWithQuantityToOrder = ({
  quantityNeeded,
  shopProducts,
}: {
  quantityNeeded: Quantity;
  shopProducts: ShopProduct[];
}): ShopProductWithQuantityToOrder[] => {
  // normalise the shop products
  const normalisedShopProducts = normaliseShopProducts(shopProducts);

  // reduce until we have our quantity needed
  let quantityStillNeeded = quantityNeeded;
  const bestMatchedShopProducts: ShopProductWithQuantityToOrder[] = [];

  while (shopProducts.length && quantityStillNeeded > 0) {
    // find the best matched product for the quantity still needed
    const bestMatchedShopProduct = findBestMatchedShopProduct(
      quantityStillNeeded,
      normalisedShopProducts,
    );

    // add it to best matches
    if (bestMatchedShopProduct) {
      bestMatchedShopProducts.push(bestMatchedShopProduct);
    }

    // set the new quantity still needed
    const quantityAlreadyPresent = bestMatchedShopProducts.reduce(
      (quantity, current) => {
        return (quantity += current.quantityValue);
      },
      0,
    );
    quantityStillNeeded = quantityNeeded - quantityAlreadyPresent;
  }

  // combine multiples of the same product into one and update the total quantity
  // FIXME: a reduce would be better, this approach is mutating bestMatchedShopProducts
  const combinedShopProducts: ShopProductWithQuantityToOrder[] = [];

  bestMatchedShopProducts.forEach((bestMatchedShopProduct) => {
    const existingBestMatchIndex = combinedShopProducts.findIndex(
      (combinedBestMatch) => combinedBestMatch.id === bestMatchedShopProduct.id,
    );

    if (existingBestMatchIndex > -1) {
      combinedShopProducts[existingBestMatchIndex].quantityToOrder +=
        bestMatchedShopProduct.quantityToOrder;
    } else {
      combinedShopProducts.push(bestMatchedShopProduct);
    }
  });

  // prefer bulk items
  // do we have any duplicate items that can be replaced with a bulk item
  const combinedBestMatchesReplacedWithBulkItems = [...combinedShopProducts];

  const duplicateShopProducts = combinedShopProducts.filter(
    (item) => item.quantityToOrder > 1,
  );

  duplicateShopProducts.forEach((item) => {
    const totalQuantity = item.quantityToOrder * item.quantityValue;

    // can it be replaced with a bulk item?
    const canBeReplacedWithShopProduct = normalisedShopProducts.find(
      (shopProduct) => {
        const shopProductIsMultiple =
          shopProduct.quantityValue % totalQuantity === 0;

        return shopProductIsMultiple;
      },
    );

    if (canBeReplacedWithShopProduct) {
      const bulkShopProduct: ShopProductWithQuantityToOrder = {
        ...canBeReplacedWithShopProduct,
        quantityToOrder:
          totalQuantity / canBeReplacedWithShopProduct.quantityValue,
      };

      const itemIndex = combinedShopProducts.findIndex(
        (bestMatchedShopProduct) => bestMatchedShopProduct.id === item.id,
      );

      combinedBestMatchesReplacedWithBulkItems[itemIndex] = bulkShopProduct;
    }
  });

  // attach all the other products with quantityToOrder set to 0
  const allProductsWithQuantityToOrder = normalisedShopProducts.map(
    (shopProduct) => {
      const bestMatchIndex = combinedBestMatchesReplacedWithBulkItems.findIndex(
        (item) => item.id === shopProduct.id,
      );

      if (bestMatchIndex > -1) {
        return combinedBestMatchesReplacedWithBulkItems[bestMatchIndex];
      }

      return {
        ...shopProduct,
        quantityToOrder: 0,
      };
    },
  );

  // sort by quantityToOrder highest to lowest
  const sortedShopProductsWithQuantityToOrder = sortArrayOfObjectsByKey(
    allProductsWithQuantityToOrder,
    'quantityToOrder',
    true,
  );

  return sortedShopProductsWithQuantityToOrder;
};
