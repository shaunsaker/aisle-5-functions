// FIXME: these are all shared with aisle-5 (same with utils)
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

export type ShoppingLists = Record<ShoppingListId, ShoppingList>;

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

export type Username = string;

export type DeliveryAddressId = string;

export type ProvinceId = string;

export type SuburbId = string;

export interface DeliveryAddress {
  id: DeliveryAddressId;
  addressLine1: string;
  addressLine2: string;
  provinceId: ProvinceId;
  suburbId: SuburbId;
  recipientName: string;
  mobileNumber: string;
  nickname: string;
  default: boolean;
}

type DeliveryAddresses = Record<DeliveryAddressId, DeliveryAddress>;

export type UserId = string;

export type MemberId = UserId;

export interface Member {
  id: MemberId;
  nickname: string;
  email: string;
}

type Members = Record<MemberId, Member>;

export interface UserProfileData {
  username: Username;
  email: string;
  deliveryAddresses: DeliveryAddresses;
  members: Members;
  fcmToken: string;
  settingsPantryItemLowStatusThreshold: number;
  settingsListAutoUpdate: boolean;
  settingsNotifyLowPantryItems: boolean;
  settingsNotifyLowPantryItemCount: number;
}

export interface PantryItem {
  productId: ProductId;
  daysLeft: number | null; // null indicates that we don't yet have enough data
  usagePerDay: number | null; // this is different to the mobile app
}

export interface CallResponse {
  success?: boolean;
  error?: boolean;
  message?: string;
}
