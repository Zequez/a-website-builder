import { describe, it, expect } from 'vitest';
import { fetchApi } from './testUtils';

describe.only('/members', () => {
  it('should return members', async () => {
    const res = await fetchApi('/members');
    expect(res.status).toBe(200);
  });
});
