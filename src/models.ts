export type ProductId = string;

export type ShoppingListItemId = ProductId;

export type Quantity = number;

export type PricePerUnit = number;

export interface ShoppingListItem {
  productId: ShoppingListItemId;
  quantity: Quantity;
  dateAdded: string;
}

export type ShoppingListItems = Record<ShoppingListItemId, ShoppingListItem>;

export type ShoppingListId = string;

export type ShoppingListOrderTotal = number;

export interface ShoppingList {
  id: ShoppingListId;
  items: ShoppingListItems;
  active?: boolean;
  members: string[];
  createdByUid: string;
  createdByUsername: string;
  dateCreated: string;
  checkedOutByUid?: string;
  checkedOutByUsername?: string;
  dateCheckedOut?: string;
  orderTotal?: ShoppingListOrderTotal;
}

export enum ShopIds {
  Woolworths = 'woolworths',
}

export interface Shop {
  id: ShopIds;
  displayName: string;
}

export type Shops = Shop[];

export type ShopProductId = string;

export enum Unit {
  unit = 'unit',
  pk = 'pk',
  kg = 'kg',
  lt = 'lt',
}

export interface Product {
  id: ProductId;
  displayName: string;
  categoryId: string;
  unit: Unit;
  woolworthsProductIds: ShopProductId[];
}

export type ShopCategoryId = string;

export interface ShopProduct {
  categoryId: ShopCategoryId;
  displayName: string;
  id: string;
  price: number;
  quantityUnit: string;
  quantityValue: Quantity;
}

export interface NormalisedShopProduct extends ShopProduct {
  quantityUnit: Unit;
}

export interface ShopProductWithQuantityToOrder extends NormalisedShopProduct {
  quantityToOrder: Quantity;
}

export const COMMISSION_FACTOR = 0.1;

export type ShoppingCartDeliverySlotId = string;

export interface ShoppingCartDeliverySlot {
  id: ShoppingCartDeliverySlotId;
  cost: number;
  timeFrom: string; // FIXME: we should use Time as a type
  timeTo: string;
}

export type ShoppingCartDeliverySlots = Record<
  ShoppingCartDeliverySlotId,
  ShoppingCartDeliverySlot
>;
