import { makeShopProduct } from '../testUtils/makeShopProduct';
import { getBestMatchedProducts } from './getBestMatchedProducts';

describe('getBestMatchedProducts', () => {
  it('returns no products when no options were provided', () => {
    const bestMatchedProducts = getBestMatchedProducts({
      quantityNeeded: 1,
      options: [],
    });

    expect(bestMatchedProducts.length).toEqual(0);
  });

  it("returns a single product with the lowest quantity available (don't buy too much) 1", () => {
    const expectedProduct = makeShopProduct({
      quantityValue: 2,
    });
    const bestMatchedProducts = getBestMatchedProducts({
      quantityNeeded: 1,
      options: [
        makeShopProduct({
          quantityValue: 4,
        }),
        expectedProduct,
      ],
    });

    expect(bestMatchedProducts.length).toEqual(1);
    expect(bestMatchedProducts[0].shopProductId).toEqual(expectedProduct.id);
    expect(bestMatchedProducts[0].quantityToOrder).toEqual(1);
  });

  it("returns a single product with the lowest quantity available (don't buy too much) 2", () => {
    const expectedProduct = makeShopProduct({
      quantityValue: 2,
    });
    const bestMatchedProducts = getBestMatchedProducts({
      quantityNeeded: 2,
      options: [
        makeShopProduct({
          quantityValue: 4,
        }),
        expectedProduct,
      ],
    });

    expect(bestMatchedProducts.length).toEqual(1);
    expect(bestMatchedProducts[0].shopProductId).toEqual(expectedProduct.id);
    expect(bestMatchedProducts[0].quantityToOrder).toEqual(1);
  });

  it('returns multiple of a single product 1', () => {
    const bestMatchedProducts = getBestMatchedProducts({
      quantityNeeded: 10,
      options: [
        makeShopProduct({
          quantityValue: 5, // buy 2 of these
        }),
      ],
    });

    expect(bestMatchedProducts.length).toEqual(1);
    expect(bestMatchedProducts[0].quantityToOrder).toEqual(2);
  });

  it('returns multiple of a single product 2', () => {
    const expectedProduct = makeShopProduct({
      quantityValue: 5, // buy 2 of these
    });
    const bestMatchedProducts = getBestMatchedProducts({
      quantityNeeded: 10,
      options: [
        makeShopProduct({
          quantityValue: 1,
        }),
        expectedProduct,
      ],
    });

    expect(bestMatchedProducts.length).toEqual(1);
    expect(bestMatchedProducts[0].shopProductId).toEqual(expectedProduct.id);
    expect(bestMatchedProducts[0].quantityToOrder).toEqual(2);
  });

  it('returns multiple products', () => {
    const lowerQuantityExpectedProduct = makeShopProduct({
      quantityValue: 1, // buy 1 of these
    });
    const higherQuantityExpectedProduct = makeShopProduct({
      quantityValue: 3, // buy 3 of these
    });
    const bestMatchedProducts = getBestMatchedProducts({
      quantityNeeded: 10,
      options: [
        lowerQuantityExpectedProduct,
        higherQuantityExpectedProduct,
        makeShopProduct({
          quantityValue: 20, // buy 0 of these
        }),
      ],
    });

    expect(bestMatchedProducts.length).toEqual(2);
    expect(bestMatchedProducts[0].shopProductId).toEqual(
      higherQuantityExpectedProduct.id,
    );
    expect(bestMatchedProducts[0].quantityToOrder).toEqual(3);
    expect(bestMatchedProducts[1].shopProductId).toEqual(
      lowerQuantityExpectedProduct.id,
    );
    expect(bestMatchedProducts[1].quantityToOrder).toEqual(1);
  });

  it('returns larger quantity products when it makes sense 1', () => {
    const expectedProduct = makeShopProduct({
      quantityValue: 1, // buy 1 of these
    });
    const bestMatchedProducts = getBestMatchedProducts({
      quantityNeeded: 0.75,
      options: [
        makeShopProduct({
          quantityValue: 0.5, // not 2 of these
        }),
        expectedProduct,
      ],
    });

    expect(bestMatchedProducts.length).toEqual(1);
    expect(bestMatchedProducts[0].shopProductId).toEqual(expectedProduct.id);
    expect(bestMatchedProducts[0].quantityToOrder).toEqual(1);
  });
});
