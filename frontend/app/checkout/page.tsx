'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { formatCurrency } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCart } from '@/store/cartSlice';
import { placeOrder } from '@/store/orderSlice';

const EMPTY_FORM = {
  shippingLine1: '',
  shippingLine2: '',
  city: '',
  postalCode: '',
  country: 'India'
};

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token, hydrated } = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart.cart);
  const { placing, error } = useAppSelector((state) => state.orders);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (hydrated && !token) {
      router.push('/login?next=/checkout');
    } else if (token) {
      void dispatch(fetchCart());
    }
  }, [dispatch, hydrated, token, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await dispatch(placeOrder(form));
    if (placeOrder.fulfilled.match(result)) {
      router.push('/orders');
    }
  }

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500">Confirm your shipping address to place the order.</p>

      {error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form className="card space-y-5 p-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="line1">Address line 1</label>
            <input
              id="line1"
              required
              className="input-field mt-2"
              value={form.shippingLine1}
              onChange={(event) => update('shippingLine1', event.target.value)}
              placeholder="Flat / house number, street"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="line2">Address line 2 (optional)</label>
            <input
              id="line2"
              className="input-field mt-2"
              value={form.shippingLine2}
              onChange={(event) => update('shippingLine2', event.target.value)}
              placeholder="Landmark, area"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="city">City</label>
              <input
                id="city"
                required
                className="input-field mt-2"
                value={form.city}
                onChange={(event) => update('city', event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="postal">Postal code</label>
              <input
                id="postal"
                required
                className="input-field mt-2"
                value={form.postalCode}
                onChange={(event) => update('postalCode', event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="country">Country</label>
              <input
                id="country"
                required
                className="input-field mt-2"
                value={form.country}
                onChange={(event) => update('country', event.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={placing === 'loading' || !cart || cart.items.length === 0}
          >
            {placing === 'loading' ? 'Placing order…' : `Place order · ${formatCurrency(cart?.subtotal ?? 0)}`}
          </button>
        </form>

        <aside className="card h-fit p-6">
          <h2 className="text-lg font-bold text-slate-900">Your items</h2>
          {cart?.items.length ? (
            <ul className="mt-4 space-y-3 text-sm">
              {cart.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-slate-600">{item.name} × {item.quantity}</span>
                  <span className="font-semibold">{formatCurrency(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Your cart is empty.</p>
          )}
          <Link href="/cart" className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline">
            Edit cart
          </Link>
        </aside>
      </div>
    </div>
  );
}
