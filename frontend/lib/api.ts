import { buildQuery, errorMessage } from './utils';
import type {
  AuthResponse,
  CartResponse,
  CheckoutPayload,
  LoginPayload,
  OrderResponse,
  PagedResponse,
  Product,
  ProductPayload,
  RegisterPayload
} from '@/types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, headers: customHeaders, ...rest } = options;
  const headers = new Headers(customHeaders);
  headers.set('Accept', 'application/json');
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store'
    });
  } catch {
    throw new ApiError('Unable to reach the server. Please check that the backend is running.', 0);
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const errorBody = payload as { message?: string; fieldErrors?: Record<string, string> } | null;
    throw new ApiError(
      errorBody?.message ?? `Request failed with status ${response.status}`,
      response.status,
      errorBody?.fieldErrors ?? {}
    );
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const api = {
  auth: {
    register: (payload: RegisterPayload) =>
      request<AuthResponse>('/api/auth/register', { method: 'POST', body: payload }),
    login: (payload: LoginPayload) =>
      request<AuthResponse>('/api/auth/login', { method: 'POST', body: payload })
  },
  products: {
    list: (params: {
      search?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: string;
    } = {}) => request<PagedResponse<Product>>(`/api/products${buildQuery(params)}`),
    get: (id: number | string) => request<Product>(`/api/products/${id}`)
  },
  cart: {
    get: (token: string) => request<CartResponse>('/api/cart', { token }),
    add: (token: string, productId: number, quantity: number) =>
      request<CartResponse>('/api/cart/items', {
        method: 'POST',
        token,
        body: { productId, quantity }
      }),
    update: (token: string, productId: number, quantity: number) =>
      request<CartResponse>(`/api/cart/items/${productId}`, {
        method: 'PUT',
        token,
        body: { quantity }
      }),
    remove: (token: string, productId: number) =>
      request<CartResponse>(`/api/cart/items/${productId}`, { method: 'DELETE', token }),
    clear: (token: string) => request<void>('/api/cart', { method: 'DELETE', token })
  },
  orders: {
    checkout: (token: string, payload: CheckoutPayload) =>
      request<OrderResponse>('/api/orders/checkout', { method: 'POST', token, body: payload }),
    history: (token: string, page = 0, size = 10) =>
      request<PagedResponse<OrderResponse>>(`/api/orders${buildQuery({ page, size })}`, { token })
  },
  admin: {
    createProduct: (token: string, payload: ProductPayload) =>
      request<Product>('/api/admin/products', { method: 'POST', token, body: payload }),
    updateProduct: (token: string, id: number, payload: ProductPayload) =>
      request<Product>(`/api/admin/products/${id}`, { method: 'PUT', token, body: payload }),
    deleteProduct: (token: string, id: number) =>
      request<void>(`/api/admin/products/${id}`, { method: 'DELETE', token })
  }
};

export { errorMessage };
