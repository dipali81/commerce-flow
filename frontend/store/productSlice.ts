import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/utils';
import type { PagedResponse, Product, ProductPayload } from '@/types';
import type { RootState } from './index';

interface ProductFilters {
  search: string;
  category: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

interface ProductState {
  items: Product[];
  current: Product | null;
  filters: ProductFilters;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  adminStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  adminError: string | null;
}

const initialState: ProductState = {
  items: [],
  current: null,
  filters: { search: '', category: '', sortBy: 'createdAt', sortDir: 'desc' },
  page: 0,
  size: 12,
  totalElements: 0,
  totalPages: 0,
  status: 'idle',
  error: null,
  adminStatus: 'idle',
  adminError: null
};

interface ThunkConfig {
  state: RootState;
  rejectValue: string;
}

export const fetchProducts = createAsyncThunk<PagedResponse<Product>, void, ThunkConfig>(
  'products/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    const { filters, page, size } = getState().products;
    try {
      return await api.products.list({
        search: filters.search,
        category: filters.category,
        page,
        size,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir
      });
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const fetchProduct = createAsyncThunk<Product, number, ThunkConfig>(
  'products/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await api.products.get(id);
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const createProductThunk = createAsyncThunk<Product, ProductPayload, ThunkConfig>(
  'products/adminCreate',
  async (payload, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue('Please sign in as an administrator');
    try {
      return await api.admin.createProduct(token, payload);
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const updateProductThunk = createAsyncThunk<Product, { id: number; payload: ProductPayload }, ThunkConfig>(
  'products/adminUpdate',
  async ({ id, payload }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue('Please sign in as an administrator');
    try {
      return await api.admin.updateProduct(token, id, payload);
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const deleteProductThunk = createAsyncThunk<number, number, ThunkConfig>(
  'products/adminDelete',
  async (id, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue('Please sign in as an administrator');
    try {
      await api.admin.deleteProduct(token, id);
      return id;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.page = 0;
    },
    setCategory(state, action: PayloadAction<string>) {
      state.filters.category = action.payload;
      state.page = 0;
    },
    setSort(state, action: PayloadAction<{ sortBy: string; sortDir: 'asc' | 'desc' }>) {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortDir = action.payload.sortDir;
      state.page = 0;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    clearAdminError(state) {
      state.adminError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<PagedResponse<Product>>) => {
        state.status = 'succeeded';
        state.items = action.payload.content;
        state.page = action.payload.page;
        state.size = action.payload.size;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to load products';
      })
      .addCase(fetchProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to load product details';
      })
      .addMatcher(
        (action) => action.type.startsWith('products/admin') && action.type.endsWith('/pending'),
        (state) => {
          state.adminStatus = 'loading';
          state.adminError = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('products/admin') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.adminStatus = 'succeeded';
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('products/admin') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.adminStatus = 'failed';
          state.adminError = (action as { payload?: string }).payload ?? 'Admin operation failed';
        }
      );
  }
});

export const { setSearch, setCategory, setSort, setPage, clearAdminError } = productSlice.actions;
export default productSlice.reducer;
