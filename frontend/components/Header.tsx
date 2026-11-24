'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { ShoppingCart, Store, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/authSlice';
import { resetCart } from '@/store/cartSlice';
import { fetchCart } from '@/store/cartSlice';
import { fetchProducts, setSearch } from '@/store/productSlice';

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token, user, hydrated } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector((state) => state.cart.cart?.totalItems ?? 0);
  const search = useAppSelector((state) => state.products.filters.search);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    if (token) void dispatch(fetchCart());
  }, [token, dispatch]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(setSearch(searchInput));
    void dispatch(fetchProducts());
    router.push('/');
  }

  function handleLogout() {
    dispatch(logout());
    dispatch(resetCart());
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-900">
          <Store className="h-6 w-6 text-brand-600" />
          <span>CommerceFlow</span>
        </Link>

        <form onSubmit={handleSearch} className="ml-4 hidden flex-1 md:block">
          <input
            className="input-field"
            aria-label="Search products"
            placeholder="Search products, SKU or category…"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </form>

        <nav className="ml-auto flex items-center gap-2 text-sm font-medium">
          <Link href="/" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100">
            Products
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {hydrated && user?.role === 'ROLE_ADMIN' && (
            <Link
              href="/admin/products"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="hidden lg:inline">Admin</span>
            </Link>
          )}

          {hydrated && token && user ? (
            <>
              <Link
                href="/orders"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100"
              >
                <Package className="h-5 w-5" />
                <span className="hidden lg:inline">Orders</span>
              </Link>
              <span className="hidden max-w-32 truncate rounded-lg bg-slate-100 px-3 py-2 text-slate-700 xl:inline">
                {user.fullName}
              </span>
              <button type="button" onClick={handleLogout} className="btn-secondary !px-3">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : hydrated ? (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary !px-3">
                Register
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
