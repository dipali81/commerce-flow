import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api, ApiError } from '@/lib/api';
import { errorMessage } from '@/lib/utils';
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types';

const TOKEN_KEY = 'commerce-flow-token';
const USER_KEY = 'commerce-flow-user';

export interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  hydrated: false,
  status: 'idle',
  error: null
};

function toUser(response: AuthResponse): AuthUser {
  return {
    userId: response.userId,
    fullName: response.fullName,
    email: response.email,
    role: response.role
  };
}

function persist(response: AuthResponse) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, response.accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(toUser(response)));
}

function clearPersisted() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

function rejectionMessage(error: unknown): string {
  if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
    return Object.values(error.fieldErrors)[0];
  }
  return errorMessage(error);
}

export const hydrateAuth = createAsyncThunk<AuthResponse | null>('auth/hydrate', async () => {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  const rawUser = window.localStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;
  try {
    const user = JSON.parse(rawUser) as AuthUser;
    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresInSeconds: 0,
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };
  } catch {
    clearPersisted();
    return null;
  }
});

export const registerThunk = createAsyncThunk<AuthResponse, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.auth.register(payload);
      persist(response);
      return response;
    } catch (error) {
      return rejectWithValue(rejectionMessage(error));
    }
  }
);

export const loginThunk = createAsyncThunk<AuthResponse, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.auth.login(payload);
      persist(response);
      return response;
    } catch (error) {
      return rejectWithValue(rejectionMessage(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      clearPersisted();
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.pending, (state) => {
        state.hydrated = false;
      })
      .addCase(hydrateAuth.fulfilled, (state, action: PayloadAction<AuthResponse | null>) => {
        state.hydrated = true;
        if (action.payload) {
          state.token = action.payload.accessToken;
          state.user = toUser(action.payload);
        }
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.hydrated = true;
      })
      .addCase(registerThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.status = 'succeeded';
        state.token = action.payload.accessToken;
        state.user = toUser(action.payload);
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Registration failed';
      })
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.status = 'succeeded';
        state.token = action.payload.accessToken;
        state.user = toUser(action.payload);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Sign in failed';
      });
  }
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
