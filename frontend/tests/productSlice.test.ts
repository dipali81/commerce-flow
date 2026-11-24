import { describe, expect, it } from 'vitest';
import productReducer, { fetchProducts, setCategory, setPage, setSearch, setSort } from '@/store/productSlice';
import type { PagedResponse, Product } from '@/types';

const product: Product = {
  id: 1,
  sku: 'TEST-1',
  name: 'Test product',
  description: 'A test product',
  category: 'Testing',
  price: 100,
  stockQuantity: 5,
  imageUrl: null,
  active: true,
  inStock: true,
  createdAt: '2026-11-24T00:00:00'
};

const page: PagedResponse<Product> = {
  content: [product],
  page: 0,
  size: 12,
  totalElements: 1,
  totalPages: 1,
  last: true
};

describe('productSlice', () => {
  it('updates filters and resets pagination', () => {
    let state = productReducer(undefined, setPage(3));
    expect(state.page).toBe(3);
    state = productReducer(state, setSearch('laptop'));
    expect(state.filters.search).toBe('laptop');
    expect(state.page).toBe(0);
    state = productReducer(state, setCategory('Electronics'));
    expect(state.filters.category).toBe('Electronics');
    state = productReducer(state, setSort({ sortBy: 'price', sortDir: 'asc' }));
    expect(state.filters.sortBy).toBe('price');
    expect(state.filters.sortDir).toBe('asc');
  });

  it('stores fetched products', () => {
    const state = productReducer(undefined, fetchProducts.fulfilled(page, 'request-1'));
    expect(state.items).toHaveLength(1);
    expect(state.totalElements).toBe(1);
    expect(state.status).toBe('succeeded');
  });
});
