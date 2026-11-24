export default function Loading() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="mx-auto mt-6 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
