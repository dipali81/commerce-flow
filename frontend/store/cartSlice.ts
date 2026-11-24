import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/utils';
import type { CartResponse } from '@/types';
import type { RootState } from './index';

interface CartState {
  cart: CartResponse | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  actionStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  status: 'idle',
  actionStatus: 'idle',
  error: null
};

interface ThunkConfig {
  state: RootState;
  rejectValue: string;
}

export const fetchCart = createAsyncThunk<CartResponse, void, ThunkConfig>(
  'cart/fetch',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue('Please sign in to view your cart');
    try {
      return await api.cart.get(token);
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const addToCart = createAsyncThunk<CartResponse, { productId: number; quantity: number }, ThunkConfig>(
  'cart/add',
  async ({ productId, quantity }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue('Please sign in to add items to your cart');
    try {
      return await api.cart.add(token, productId, quantity);
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const updateCartItem = createAsyncThunk<CartResponse, { productId: number; quantity: number }, ThunkConfig>(
  'cart/update',
  async ({ productId, quantity }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue('Please sign in to update your cart');
    try {
      return await api.cart.update(token, productId, quantity);
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const removeCartItem = createAsyncThunk<CartResponse, number, ThunkConfig>(
  'cart/remove',
  async (productId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue('Please sign in to update your cart');
    try {
      return await api.cart.remove(token, productId);
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart(state) {
      state.cart = null;
      state.error = null;
    },
    clearCartError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartResponse>) => {
        state.status = 'succeeded';
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to load cart';
      })
      .addMatcher(
        (action) => action.type.startsWith('cart/') && !action.type.startsWith('cart/fetch'),
        (state, action) => {
          if (action.type.endsWith('/pending')) {
            state.actionStatus = 'loading';
            state.error = null;
          } else if (action.type.endsWith('/fulfilled')) {
            state.actionStatus = 'succeeded';
            if ('payload' in action) state.cart = action.payload as CartResponse;
          } else if (action.type.endsWith('/rejected')) {
            state.actionStatus = 'failed';
            state.error = (action as { payload?: string }).payload ?? 'Cart operation failed';
          }
        }
      );
  }
});

export const { resetCart, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
