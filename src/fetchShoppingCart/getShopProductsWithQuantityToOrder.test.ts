import { makeShopProduct } from '../testUtils/makeShopProduct';
import { getShopProductsWithQuantityToOrder } from './getShopProductsWithQuantityToOrder';

describe('getShopProductsWithQuantityToOrder', () => {
  it('returns no products when no shopProducts were provided', () => {
    const shopProductsWithQuantityToOrder = getShopProductsWithQuantityToOrder({
      quantityNeeded: 1,
      shopProducts: [],
    });

    expect(shopProductsWithQuantityToOrder.length).toEqual(0);
  });

  it("returns a single product with the lowest quantity available (don't buy too much) 1", () => {
    const expectedProduct = makeShopProduct({
      quantityValue: 2,
    });
    const shopProducts = [
      makeShopProduct({
        quantityValue: 4,
      }),
      expectedProduct,
    ];
    const shopProductsWithQuantityToOrder = getShopProductsWithQuantityToOrder({
      quantityNeeded: 1,
      shopProducts,
    });

    expect(shopProductsWithQuantityToOrder.length).toEqual(shopProducts.length);
    expect(shopProductsWithQuantityToOrder[0].id).toEqual(expectedProduct.id);
    expect(shopProductsWithQuantityToOrder[0].quantityToOrder).toEqual(1);
  });

  it("returns a single product with the lowest quantity available (don't buy too much) 2", () => {
    const expectedProduct = makeShopProduct({
      quantityValue: 2,
    });
    const shopProductsWithQuantityToOrder = getShopProductsWithQuantityToOrder({
      quantityNeeded: 2,
      shopProducts: [
        makeShopProduct({
          quantityValue: 4,
        }),
        expectedProduct,
      ],
    });

    expect(shopProductsWithQuantityToOrder[0].id).toEqual(expectedProduct.id);
    expect(shopProductsWithQuantityToOrder[0].quantityToOrder).toEqual(1);
  });

  it('returns multiple of a single product 1', () => {
    const shopProductsWithQuantityToOrder = getShopProductsWithQuantityToOrder({
      quantityNeeded: 10,
      shopProducts: [
        makeShopProduct({
          quantityValue: 5, // buy 2 of these
        }),
      ],
    });

    expect(shopProductsWithQuantityToOrder.length).toEqual(1);
    expect(shopProductsWithQuantityToOrder[0].quantityToOrder).toEqual(2);
  });

  it('returns multiple of a single product 2', () => {
    const expectedProduct = makeShopProduct({
      quantityValue: 5, // buy 2 of these
    });
    const shopProductsWithQuantityToOrder = getShopProductsWithQuantityToOrder({
      quantityNeeded: 10,
      shopProducts: [
        makeShopProduct({
          quantityValue: 1,
        }),
        expectedProduct,
      ],
    });

    expect(shopProductsWithQuantityToOrder[0].id).toEqual(expectedProduct.id);
    expect(shopProductsWithQuantityToOrder[0].quantityToOrder).toEqual(2);
  });

  it('returns multiple products', () => {
    const lowerQuantityExpectedProduct = makeShopProduct({
      quantityValue: 1, // buy 1 of these
    });
    const higherQuantityExpectedProduct = makeShopProduct({
      quantityValue: 3, // buy 3 of these
    });
    const shopProductsWithQuantityToOrder = getShopProductsWithQuantityToOrder({
      quantityNeeded: 10,
      shopProducts: [
        lowerQuantityExpectedProduct,
        higherQuantityExpectedProduct,
        makeShopProduct({
          quantityValue: 20, // buy 0 of these
        }),
      ],
    });

    expect(shopProductsWithQuantityToOrder[0].id).toEqual(
      higherQuantityExpectedProduct.id,
    );
    expect(shopProductsWithQuantityToOrder[0].quantityToOrder).toEqual(3);
    expect(shopProductsWithQuantityToOrder[1].id).toEqual(
      lowerQuantityExpectedProduct.id,
    );
    expect(shopProductsWithQuantityToOrder[1].quantityToOrder).toEqual(1);
  });

  it('returns larger quantity products when it makes sense 1', () => {
    const expectedProduct = makeShopProduct({
      quantityValue: 1, // buy 1 of these
    });
    const shopProductsWithQuantityToOrder = getShopProductsWithQuantityToOrder({
      quantityNeeded: 0.75,
      shopProducts: [
        makeShopProduct({
          quantityValue: 0.5, // not 2 of these
        }),
        expectedProduct,
      ],
    });

    expect(shopProductsWithQuantityToOrder[0].id).toEqual(expectedProduct.id);
    expect(shopProductsWithQuantityToOrder[0].quantityToOrder).toEqual(1);
  });
});
