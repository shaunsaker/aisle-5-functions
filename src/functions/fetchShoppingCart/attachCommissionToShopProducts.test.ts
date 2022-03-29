import { getCommission } from './attachCommissionToShopProducts';

describe('getCommission', () => {
  it('returns 0 if the basePrice is 0', () => {
    const basePrice = 0;
    const commission = 0.1;

    expect(getCommission(basePrice, commission)).toEqual(0);
  });

  it('returns the basePrice if commission is 0', () => {
    const basePrice = 19.99;
    const commission = 0;

    expect(getCommission(basePrice, commission)).toEqual(basePrice);
  });

  it('returns the basePrice with commission 1', () => {
    const basePrice = 19.99;
    const commission = 0.1;

    expect(getCommission(basePrice, commission)).toEqual(21.99);
  });

  it('returns the basePrice with commission 2', () => {
    const basePrice = 4.99;
    const commission = 0.1;

    expect(getCommission(basePrice, commission)).toEqual(5.99);
  });

  it('returns the basePrice with commission 3', () => {
    const basePrice = 129.99;
    const commission = 0.1;

    expect(getCommission(basePrice, commission)).toEqual(142.99);
  });

  it('returns two digits', () => {
    const basePrice = 129.99;
    const commission = 0.1;

    expect(getCommission(basePrice, commission)).toEqual(142.99);
  });
});
