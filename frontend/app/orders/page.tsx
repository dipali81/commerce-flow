'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CheckCircle2, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchOrders } from '@/store/orderSlice';

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token, hydrated } = useAppSelector((state) => state.auth);
  const { orders, status, error, lastPlacedOrderNumber } = useAppSelector((state) => state.orders);

  useEffect(() => {
    if (hydrated && !token) {
      router.push('/login?next=/orders');
    } else if (token) {
      void dispatch(fetchOrders());
    }
  }, [dispatch, hydrated, token, router]);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900">Order history</h1>

      {lastPlacedOrderNumber && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          <span>Order <strong>{lastPlacedOrderNumber}</strong> was placed successfully.</span>
        </div>
      )}
      {error && <p className="mt-6 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {status === 'loading' && orders.length === 0 ? (
        <p className="mt-10 text-slate-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="card mt-10 p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">No orders yet</p>
          <Link href="/" className="btn-primary mt-5 inline-flex">Start shopping</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <article key={order.id} className="card overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Order number</p>
                  <p className="font-bold text-slate-900">{order.orderNumber}</p>
                </div>
                <div className="text-sm text-slate-500">
                  Placed {new Date(order.placedAt).toLocaleString('en-IN')}
                </div>
                <span className="badge w-fit bg-brand-50 text-brand-700">{order.status}</span>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.productName} × {item.quantity}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Ship to: {order.shippingLine1}, {order.city} {order.postalCode}, {order.country}
                  </p>
                  <p className="text-lg font-bold text-brand-700">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
