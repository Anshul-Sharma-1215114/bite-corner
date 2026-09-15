import type { AddressLabel, OrderType, OrderStatus, PaymentMethod, PaymentStatus, Role } from "@bite-corner/shared";

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isVeg: boolean;
  available: boolean;
  categoryId: string;
  category?: Category;
}

export interface ComboItem {
  id: string;
  comboId: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  swappable: boolean;
}

export interface Combo {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  available: boolean;
  items: ComboItem[];
}

export interface Address {
  id: string;
  label: AddressLabel;
  line1: string;
  landmark: string | null;
  area: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface ShopConfigPublic {
  name: string;
  deliveryFee: string;
  minOrderValue: string;
  taxPercent: string;
  openTime: string;
  closeTime: string;
  address: string | null;
  upiId: string | null;
  whatsappNumber: string | null;
  isOpenNow: boolean;
}

export interface OrderItemDto {
  id: string;
  menuItemId: string | null;
  comboId: string | null;
  name: string;
  quantity: number;
  priceAtOrder: string;
  comboSelections?: { swaps: { fromName: string; toName: string }[] } | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  itemsTotal: string;
  deliveryFee: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  specialInstructions: string | null;
  placedAt: string;
  items: OrderItemDto[];
  address: Address | null;
  review: { rating: number; comment: string | null } | null;
  deliveryAgentId?: string | null;
  deliveryAgent: { id: string; name: string; phone: string | null } | null;
  customer?: { id: string; name: string; phone: string | null };
}

export interface FeaturedReview {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  createdAt: string;
}

export interface AuthUserDto {
  id: string;
  name: string;
  role: Role;
  phone?: string | null;
  email?: string | null;
}
