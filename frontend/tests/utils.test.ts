import { describe, expect, it } from 'vitest';
import { buildQuery, errorMessage, formatCurrency, truncate } from '@/lib/utils';

describe('utility helpers', () => {
  it('formats currency using Indian locale', () => {
    expect(formatCurrency(1234)).toContain('1,234');
    expect(formatCurrency('not-a-number')).toContain('0');
  });

  it('builds queries without empty or undefined values', () => {
    expect(buildQuery({ search: 'laptop', category: '', page: 0, size: undefined })).toBe('?search=laptop&page=0');
    expect(buildQuery({})).toBe('');
  });

  it('truncates long text and falls back on unknown errors', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcde…');
    expect(truncate(null)).toBe('');
    expect(errorMessage('plain string')).toBe('Something went wrong. Please try again.');
  });
});
