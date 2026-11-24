'use client';

import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProducts, setCategory, setPage, setSearch, setSort } from '@/store/productSlice';

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Books', 'Accessories'];

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { items, filters, page, totalPages, totalElements, status, error } = useAppSelector(
    (state) => state.products
  );

  useEffect(() => {
    void dispatch(fetchProducts());
  }, [dispatch, filters.search, filters.category, filters.sortBy, filters.sortDir, page]);

  return (
    <>
      <section className="bg-brand-900 text-white">
        <div className="container-page grid gap-8 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="badge bg-white/10 text-brand-100">Order &amp; Inventory Demo</p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Everything you need to run a modern store.
            </h1>
            <p className="mt-4 max-w-xl text-brand-100">
              Browse products, manage a real cart, check out with guarded inventory updates and review your orders —
              all backed by Spring Boot REST APIs.
            </p>
          </div>
          <div className="card self-center bg-white p-6 text-slate-900">
            <p className="text-sm font-semibold text-slate-500">What this demo covers</p>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <li>✅ JWT registration &amp; login</li>
              <li>✅ Product search &amp; details</li>
              <li>✅ Cart with stock checks</li>
              <li>✅ Checkout &amp; order history</li>
              <li>✅ Admin product CRUD</li>
              <li>✅ CI/CD with GitHub Actions</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Products</h2>
            <p className="text-sm text-slate-500">{totalElements} products available</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                aria-label="Search products"
                className="input-field pl-9 sm:w-64"
                placeholder="Search by name or SKU"
                defaultValue={filters.search}
                onChange={(event) => dispatch(setSearch(event.target.value))}
              />
            </div>
            <select
              aria-label="Filter by category"
              className="input-field sm:w-48"
              value={filters.category}
              onChange={(event) => dispatch(setCategory(event.target.value))}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category === 'All' ? '' : category}>{category}</option>
              ))}
            </select>
            <select
              aria-label="Sort products"
              className="input-field sm:w-48"
              value={`${filters.sortBy}:${filters.sortDir}`}
              onChange={(event) => {
                const [sortBy, sortDir] = event.target.value.split(':');
                dispatch(setSort({ sortBy, sortDir: sortDir as 'asc' | 'desc' }));
              }}
            >
              <option value="createdAt:desc">Newest first</option>
              <option value="price:asc">Price: low to high</option>
              <option value="price:desc">Price: high to low</option>
              <option value="name:asc">Name: A–Z</option>
            </select>
          </div>
        </div>

        {error && <p className="mt-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

        {status === 'loading' && items.length === 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="card h-80 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="mt-10 text-center text-slate-500">No products match your filters.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              className="btn-secondary"
              disabled={page === 0}
              onClick={() => dispatch(setPage(page - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-slate-600">Page {page + 1} of {totalPages}</span>
            <button
              type="button"
              className="btn-secondary"
              disabled={page >= totalPages - 1}
              onClick={() => dispatch(setPage(page + 1))}
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>
    </>
  );
}
