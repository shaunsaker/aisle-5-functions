import {
  BestMatch,
  NormalisedShopProduct,
  Quantity,
  ShopProduct,
  Unit,
} from '../models';
import { sortArrayOfObjectsByKey } from '../utils/sortArrayOfObjectsByKey';

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

const findBestMatchedShopProduct = (
  quantityNeeded: number,
  options: ShopProduct[],
): BestMatch | null => {
  // ie. choose option with smallest quantity higher or equal to our quantity needed
  // (only if there are no lower items)
  // OR if there aren't options with higher quantity, choose multiples of options with highest quantity lower than

  if (!options.length) {
    return null;
  }

  // sort from highest to lowest
  const sortedOptions = sortArrayOfObjectsByKey<ShopProduct>(
    options,
    'quantityValue',
    true,
  );

  const itemsWithLowerQuantity = sortedOptions.filter(
    (option) => option.quantityValue <= quantityNeeded,
  );

  let bestMatchedShopProduct: ShopProduct;

  if (itemsWithLowerQuantity.length) {
    // return the item with the highest quantity that is lower than the quantity needed
    bestMatchedShopProduct = itemsWithLowerQuantity[0];
  } else {
    // return the item with the lowest quantity
    bestMatchedShopProduct = sortedOptions.reverse()[0];
  }

  const bestMatch: BestMatch = {
    shopProductId: bestMatchedShopProduct.id,
    pricePerUnit: bestMatchedShopProduct.price,
    quantity: bestMatchedShopProduct.quantityValue,
    quantityToOrder: 1,
  };

  return bestMatch;
};

// returns the best combination of items relevant to the quantityNeeded
// e.g. I need 10 milks, they come in 1, 3 and 20 packs. Returns 3x3 and 1x1.
// NOTE: we assume the pricePerUnit decreases for bulk items
// NOTE: we assume that the units of the options are the same
// FIXME: this is quick and dirty function and can definitely be improved
export const getBestMatchedProducts = ({
  quantityNeeded,
  options,
}: {
  quantityNeeded: Quantity;
  options: ShopProduct[];
}): BestMatch[] => {
  // normalise the shop products
  const normalisedShopProducts = options.map((shopProduct) =>
    normaliseShopProduct(shopProduct),
  );

  // reduce until we have our quantity needed
  let quantityStillNeeded = quantityNeeded;
  const bestMatches: BestMatch[] = [];

  while (options.length && quantityStillNeeded > 0) {
    // find the best matched product for the quantity still needed
    const bestMatch = findBestMatchedShopProduct(
      quantityStillNeeded,
      normalisedShopProducts,
    );

    // add it to best matches
    if (bestMatch) {
      bestMatches.push(bestMatch);
    }

    // set the new quantity still needed
    const quantityAlreadyPresent = bestMatches.reduce(
      (quantity, currentBestMatch) => {
        return (quantity += currentBestMatch.quantity);
      },
      0,
    );
    quantityStillNeeded = quantityNeeded - quantityAlreadyPresent;
  }

  // combine multiples of the same product into one and update the total quantity
  // FIXME: a reduce would be better, this approach is mutating bestMatches
  const combinedBestMatches: BestMatch[] = [];

  bestMatches.forEach((bestMatch) => {
    const existingBestMatchIndex = combinedBestMatches.findIndex(
      (combinedBestMatch) =>
        combinedBestMatch.shopProductId === bestMatch.shopProductId,
    );

    if (existingBestMatchIndex > -1) {
      combinedBestMatches[existingBestMatchIndex].quantityToOrder +=
        bestMatch.quantityToOrder;
    } else {
      combinedBestMatches.push(bestMatch);
    }
  });

  // prefer bulk items
  // do we have any duplicate items that can be replaced with a bulk item
  const combinedBestMatchesReplacedWithBulkItems = [...combinedBestMatches];

  const duplicateItems = combinedBestMatches.filter(
    (item) => item.quantityToOrder > 1,
  );

  duplicateItems.forEach((item) => {
    const totalQuantity = item.quantityToOrder * item.quantity;

    // can it be replaced with a bulk item?
    const canBeReplacedWith = normalisedShopProducts.find((shopProduct) => {
      const shopProductIsMultiple =
        shopProduct.quantityValue % totalQuantity === 0;

      return shopProductIsMultiple;
    });

    if (canBeReplacedWith) {
      const bulkBestMatch: BestMatch = {
        shopProductId: canBeReplacedWith.id,
        pricePerUnit: canBeReplacedWith.price,
        quantity: canBeReplacedWith.quantityValue,
        quantityToOrder: totalQuantity / canBeReplacedWith.quantityValue,
      };

      const itemIndex = combinedBestMatches.findIndex(
        (bestMatch) => bestMatch.shopProductId === item.shopProductId,
      );

      combinedBestMatchesReplacedWithBulkItems[itemIndex] = bulkBestMatch;
    }
  });

  // sort by quantityToOrder highest to lowest
  const sortedCombinedBestMatches = sortArrayOfObjectsByKey(
    combinedBestMatchesReplacedWithBulkItems,
    'quantityToOrder',
    true,
  );

  return sortedCombinedBestMatches;
};
