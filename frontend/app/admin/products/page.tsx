'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  createProductThunk,
  deleteProductThunk,
  fetchProducts,
  updateProductThunk
} from '@/store/productSlice';
import type { Product, ProductPayload } from '@/types';

interface FormState {
  sku: string;
  name: string;
  description: string;
  category: string;
  price: string;
  stockQuantity: string;
  imageUrl: string;
  active: boolean;
}

const EMPTY_FORM: FormState = {
  sku: '',
  name: '',
  description: '',
  category: '',
  price: '',
  stockQuantity: '0',
  imageUrl: '',
  active: true
};

function toPayload(form: FormState): ProductPayload {
  return {
    sku: form.sku.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    price: Number(form.price),
    stockQuantity: Number(form.stockQuantity),
    imageUrl: form.imageUrl.trim(),
    active: form.active
  };
}

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token, user, hydrated } = useAppSelector((state) => state.auth);
  const { items, adminStatus, adminError } = useAppSelector((state) => state.products);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!hydrated) return;
    if (!token || user?.role !== 'ROLE_ADMIN') {
      router.push('/');
      return;
    }
    void dispatch(fetchProducts());
  }, [dispatch, hydrated, token, user, router]);

  function update(field: keyof FormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description ?? '',
      category: product.category,
      price: String(product.price),
      stockQuantity: String(product.stockQuantity),
      imageUrl: product.imageUrl ?? '',
      active: product.active
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = toPayload(form);
    const result = editingId
      ? await dispatch(updateProductThunk({ id: editingId, payload }))
      : await dispatch(createProductThunk(payload));
    if (createProductThunk.fulfilled.match(result) || updateProductThunk.fulfilled.match(result)) {
      resetForm();
      void dispatch(fetchProducts());
    }
  }

  async function handleDelete(id: number) {
    const result = await dispatch(deleteProductThunk(id));
    if (deleteProductThunk.fulfilled.match(result)) void dispatch(fetchProducts());
  }

  if (!hydrated || user?.role !== 'ROLE_ADMIN') {
    return <div className="container-page py-16 text-slate-500">Checking administrator access…</div>;
  }

  return (
    <div className="container-page py-10">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-brand-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin · Products</h1>
          <p className="text-sm text-slate-500">Create, update and deactivate products.</p>
        </div>
      </div>

      {adminError && <p className="mt-6 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{adminError}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
        <form className="card h-fit space-y-4 p-6" onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit product' : 'New product'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="sku">SKU</label>
              <input id="sku" required className="input-field mt-1" value={form.sku} onChange={(e) => update('sku', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="category">Category</label>
              <input id="category" required className="input-field mt-1" value={form.category} onChange={(e) => update('category', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="name">Name</label>
            <input id="name" required className="input-field mt-1" value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="description">Description</label>
            <textarea id="description" rows={3} className="input-field mt-1" value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="price">Price</label>
              <input id="price" type="number" min="0.01" step="0.01" required className="input-field mt-1" value={form.price} onChange={(e) => update('price', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="stock">Stock</label>
              <input id="stock" type="number" min="0" required className="input-field mt-1" value={form.stockQuantity} onChange={(e) => update('stockQuantity', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="image">Image URL (optional)</label>
            <input id="image" className="input-field mt-1" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.active} onChange={(e) => update('active', e.target.checked)} />
            Active / visible in store
          </label>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1" disabled={adminStatus === 'loading'}>
              {adminStatus === 'loading' ? 'Saving…' : editingId ? 'Save changes' : 'Create product'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((product) => (
                  <tr key={product.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.sku}</p>
                    </td>
                    <td className="px-5 py-4">{formatCurrency(product.price)}</td>
                    <td className="px-5 py-4">{product.stockQuantity}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${product.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" aria-label={`Edit ${product.name}`} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50" onClick={() => startEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" aria-label={`Deactivate ${product.name}`} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" onClick={() => void handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
