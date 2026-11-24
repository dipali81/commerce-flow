import { describe, expect, it } from 'vitest';
import authReducer, { clearAuthError, logout } from '@/store/authSlice';
import type { AuthResponse } from '@/types';

const response: AuthResponse = {
  accessToken: 'token-123',
  tokenType: 'Bearer',
  expiresInSeconds: 3600,
  userId: 7,
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'ROLE_USER'
};

describe('authSlice', () => {
  it('starts unauthenticated and unhydrated', () => {
    const state = authReducer(undefined, { type: 'init' });
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.hydrated).toBe(false);
  });

  it('stores credentials on login fulfilment and clears them on logout', () => {
    const authenticated = authReducer(undefined, { type: 'auth/login/fulfilled', payload: response });
    expect(authenticated.token).toBe('token-123');
    expect(authenticated.user?.email).toBe('ada@example.com');

    const loggedOut = authReducer(authenticated, logout());
    expect(loggedOut.token).toBeNull();
    expect(loggedOut.user).toBeNull();
  });

  it('clears errors', () => {
    const failed = authReducer(undefined, {
      type: 'auth/login/rejected',
      payload: 'Invalid email or password'
    });
    expect(failed.error).toBe('Invalid email or password');
    expect(authReducer(failed, clearAuthError()).error).toBeNull();
  });
});
