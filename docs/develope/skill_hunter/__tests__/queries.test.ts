import { buildSearchQuery } from '@/lib/queries';

describe('buildSearchQuery', () => {
  test('returns query string for full-text search', () => {
    expect(buildSearchQuery('brainstorm')).toBe('name.ilike.%brainstorm%,description.ilike.%brainstorm%');
  });

  test('trims whitespace', () => {
    expect(buildSearchQuery('  foo  ')).toBe('name.ilike.%foo%,description.ilike.%foo%');
  });
});
