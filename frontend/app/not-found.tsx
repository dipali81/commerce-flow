import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-6xl font-black text-brand-100">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you are looking for does not exist.</p>
      <Link href="/" className="btn-primary mt-6 inline-flex">Back to products</Link>
    </div>
  );
}
