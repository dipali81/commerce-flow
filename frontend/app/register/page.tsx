'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearAuthError, registerThunk } from '@/store/authSlice';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error, token, hydrated } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (hydrated && token) router.push('/');
  }, [hydrated, token, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await dispatch(registerThunk(form));
    if (registerThunk.fulfilled.match(result)) router.push('/');
  }

  return (
    <div className="container-page flex justify-center py-14">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">It only takes a minute.</p>

        {error && <p className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              required
              className="input-field mt-2"
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              placeholder="Ada Lovelace"
            />
          </div>
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
              minLength={8}
              className="input-field mt-2"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="At least 8 characters"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered? <Link href="/login" className="font-semibold text-brand-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
