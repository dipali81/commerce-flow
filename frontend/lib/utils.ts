export function formatCurrency(value: number | string): string {
  const amount = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function truncate(text: string | null | undefined, maxLength = 120): string {
  if (!text) return '';
  return text.length <= maxLength ? text : `${text.slice(0, maxLength).trimEnd()}…`;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
