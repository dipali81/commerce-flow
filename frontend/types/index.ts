export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  active: boolean;
  inStock: boolean;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CartItemResponse {
  id: number;
  productId: number;
  sku: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  inStock: boolean;
}

export interface CartResponse {
  id: number | null;
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
}

export interface CheckoutPayload {
  shippingLine1: string;
  shippingLine2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  shippingLine1: string;
  shippingLine2: string | null;
  city: string;
  postalCode: string;
  country: string;
  placedAt: string;
  items: OrderItemResponse[];
}

export interface ProductPayload {
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  active: boolean;
}
