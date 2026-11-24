import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/utils';
import type { CheckoutPayload, OrderResponse, PagedResponse } from '@/types';
import type { RootState } from './index';

interface OrderState {
  orders: OrderResponse[];
  totalElements: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  placing: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastPlacedOrderNumber: string | null;
}

const initialState: OrderState = {
  orders: [],
  totalElements: 0,
  status: 'idle',
  placing: 'idle',
  error: null,
  lastPlacedOrderNumber: null
};

interface ThunkConfig {
  state: RootState;
  rejectValue: string;
}

export const fetchOrders = createAsyncThunk<PagedResponse<OrderResponse>, void, ThunkConfig>(
  'orders/fetch',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue('Please sign in to view your orders');
    try {
      return await api.orders.history(token);
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

export const placeOrder = createAsyncThunk<OrderResponse, CheckoutPayload, ThunkConfig>(
  'orders/place',
  async (payload, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue('Please sign in to place an order');
    try {
      return await api.orders.checkout(token, payload);
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError(state) {
      state.error = null;
    },
    clearLastPlaced(state) {
      state.lastPlacedOrderNumber = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<PagedResponse<OrderResponse>>) => {
        state.status = 'succeeded';
        state.orders = action.payload.content;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to load orders';
      })
      .addCase(placeOrder.pending, (state) => {
        state.placing = 'loading';
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action: PayloadAction<OrderResponse>) => {
        state.placing = 'succeeded';
        state.lastPlacedOrderNumber = action.payload.orderNumber;
        state.orders = [action.payload, ...state.orders];
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placing = 'failed';
        state.error = action.payload ?? 'Unable to place order';
      });
  }
});

export const { clearOrderError, clearLastPlaced } = orderSlice.actions;
export default orderSlice.reducer;
