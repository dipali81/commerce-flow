'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearAuthError, loginThunk } from '@/store/authSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error, token, hydrated } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (hydrated && token) router.push('/');
  }, [hydrated, token, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await dispatch(loginThunk(form));
    if (loginThunk.fulfilled.match(result)) router.push('/');
  }

  return (
    <div className="container-page flex justify-center py-14">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to continue shopping.</p>

        {error && <p className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              className="input-field mt-2"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className="input-field mt-2"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here? <Link href="/register" className="font-semibold text-brand-700 hover:underline">Create an account</Link>
        </p>
        <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Demo shopper: <strong>shopper@commerceflow.dev</strong> / Shopper@123
        </div>
      </div>
    </div>
  );
}
