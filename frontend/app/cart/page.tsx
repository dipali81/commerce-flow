'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCart, removeCartItem, updateCartItem } from '@/store/cartSlice';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token, hydrated } = useAppSelector((state) => state.auth);
  const { cart, status, actionStatus, error } = useAppSelector((state) => state.cart);

  useEffect(() => {
    if (hydrated && !token) {
      router.push('/login?next=/cart');
    } else if (token) {
      void dispatch(fetchCart());
    }
  }, [dispatch, hydrated, token, router]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Add a few products to get started.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900">Shopping cart</h1>
      <p className="mt-1 text-sm text-slate-500">{cart.totalItems} items in your cart</p>
      {error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-2xl font-black text-brand-200">
                {item.name.charAt(0)}
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.productId}`} className="font-semibold text-slate-900 hover:text-brand-700">
                  {item.name}
                </Link>
                <p className="text-xs uppercase tracking-wide text-slate-400">{item.sku}</p>
                <p className="mt-1 text-sm text-brand-700">{formatCurrency(item.unitPrice)}</p>
                {!item.inStock && <p className="mt-1 text-xs text-rose-600">Currently unavailable</p>}
              </div>
              <div className="flex items-center rounded-lg border border-slate-300">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${item.name}`}
                  className="p-2"
                  onClick={() => void dispatch(updateCartItem({ productId: item.productId, quantity: item.quantity - 1 }))}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${item.name}`}
                  className="p-2"
                  onClick={() => void dispatch(updateCartItem({ productId: item.productId, quantity: item.quantity + 1 }))}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-4 sm:w-40 sm:justify-end">
                <span className="font-semibold text-slate-900">{formatCurrency(item.lineTotal)}</span>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  className="text-slate-400 hover:text-rose-600"
                  onClick={() => void dispatch(removeCartItem(item.productId))}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="card h-fit p-6">
          <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="text-emerald-600">Free</span>
            </div>
            <div className="border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
              <div className="flex justify-between">
                <span>Total</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary mt-6 w-full">Proceed to checkout</Link>
          {actionStatus === 'loading' && <p className="mt-3 text-center text-xs text-slate-400">Updating cart…</p>}
          {status === 'loading' && <p className="mt-3 text-center text-xs text-slate-400">Loading cart…</p>}
        </aside>
      </div>
    </div>
  );
}
