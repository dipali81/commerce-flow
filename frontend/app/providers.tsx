'use client';

import { useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { hydrateAuth } from '@/store/authSlice';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void store.dispatch(hydrateAuth());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
