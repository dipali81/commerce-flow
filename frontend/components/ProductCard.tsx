'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { formatCurrency, truncate } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart } from '@/store/cartSlice';
import type { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const actionStatus = useAppSelector((state) => state.cart.actionStatus);
  const cartError = useAppSelector((state) => state.cart.error);
  const [justAdded, setJustAdded] = useState(false);

  async function handleAdd() {
    if (!token) {
      router.push(`/login?next=/products/${product.id}`);
      return;
    }
    const result = await dispatch(addToCart({ productId: product.id, quantity: 1 }));
    if (addToCart.fulfilled.match(result)) {
      setJustAdded(true);
    }
  }

  return (
    <article className="card flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/products/${product.id}`} className="relative block h-44 bg-gradient-to-br from-brand-50 to-slate-100">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-black text-brand-100">
            {product.name.charAt(0)}
          </div>
        )}
        <span className="badge absolute left-3 top-3 bg-white/90 text-slate-700">{product.category}</span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{product.sku}</p>
        <Link href={`/products/${product.id}`} className="mt-1 text-base font-semibold text-slate-900 hover:text-brand-700">
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{truncate(product.description, 100)}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-brand-700">{formatCurrency(product.price)}</span>
          <span className={`badge ${product.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {product.inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.inStock || actionStatus === 'loading'}
          className="btn-primary mt-4 w-full"
        >
          {justAdded ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          {justAdded ? 'Added to cart' : 'Add to cart'}
        </button>
        {cartError && <p className="mt-2 text-xs text-rose-600">{cartError}</p>}
      </div>
    </article>
  );
}
