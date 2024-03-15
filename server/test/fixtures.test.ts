import { describe, it, expect } from 'vitest';
import { records } from './fixtures';
import { T } from '@db';

describe('Bob and Pat', () => {
  it('should be the only ones in the DB', async () => {
    const members = await T.members.all();
    expect(members.length).toEqual(2);
  });
});
