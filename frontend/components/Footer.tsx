import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page flex flex-col gap-3 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} CommerceFlow. Built as a full-stack assessment project.</p>
        <div className="flex gap-5">
          <Link href="/" className="hover:text-brand-700">Products</Link>
          <Link href="/cart" className="hover:text-brand-700">Cart</Link>
          <Link href="/orders" className="hover:text-brand-700">Orders</Link>
        </div>
      </div>
    </footer>
  );
}
