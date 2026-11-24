'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart } from '@/store/cartSlice';
import { fetchProduct } from '@/store/productSlice';

export default function ProductDetailPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const product = useAppSelector((state) => state.products.current);
  const status = useAppSelector((state) => state.products.status);
  const error = useAppSelector((state) => state.products.error);
  const token = useAppSelector((state) => state.auth.token);
  const cartError = useAppSelector((state) => state.cart.error);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const numericId = Number(id);
    if (Number.isFinite(numericId) && numericId > 0) {
      void dispatch(fetchProduct(numericId));
    }
  }, [dispatch, id]);

  async function handleAdd() {
    if (!product) return;
    if (!token) {
      router.push(`/login?next=/products/${product.id}`);
      return;
    }
    const result = await dispatch(addToCart({ productId: product.id, quantity }));
    if (addToCart.fulfilled.match(result)) setAdded(true);
  }

  if (status === 'loading' && !product) return <p className="container-page py-16 text-slate-500">Loading product…</p>;
  if (error || !product || product.id !== Number(id)) {
    return (
      <div className="container-page py-16">
        <p className="rounded-lg bg-rose-50 p-4 text-rose-700">{error ?? 'Product not found.'}</p>
        <button type="button" className="btn-secondary mt-4" onClick={() => router.push('/')}>
          <ArrowLeft className="h-4 w-4" /> Back to products
        </button>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <button type="button" className="btn-secondary mb-6" onClick={() => router.push('/')}>
        <ArrowLeft className="h-4 w-4" /> Back to products
      </button>

      <div className="card grid gap-8 p-6 lg:grid-cols-2 lg:p-10">
        <div className="flex h-96 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-slate-100 text-8xl font-black text-brand-100">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-xl object-cover" />
          ) : (
            product.name.charAt(0)
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{product.sku}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-2 text-sm text-slate-500">Category: {product.category}</p>
          <p className="mt-6 leading-relaxed text-slate-600">
            {product.description ?? 'No description available.'}
          </p>
          <p className="mt-6 text-3xl font-black text-brand-700">{formatCurrency(product.price)}</p>
          <p className={`mt-2 text-sm font-semibold ${product.inStock ? 'text-emerald-600' : 'text-rose-600'}`}>
            {product.inStock ? `${product.stockQuantity} units in stock` : 'Currently out of stock'}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-slate-300">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="p-3 disabled:opacity-40"
                disabled={quantity <= 1}
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="p-3 disabled:opacity-40"
                disabled={quantity >= product.stockQuantity}
                onClick={() => setQuantity((value) => Math.min(product.stockQuantity, value + 1))}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button type="button" className="btn-primary flex-1" disabled={!product.inStock} onClick={handleAdd}>
              <ShoppingCart className="h-4 w-4" />
              {added ? 'Added to cart' : 'Add to cart'}
            </button>
          </div>
          {(cartError || !token) && (
            <p className="mt-3 text-sm text-rose-600">
              {cartError ?? 'Sign in to add this product to your cart.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
