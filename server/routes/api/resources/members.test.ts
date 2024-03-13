import { describe, it, expect } from 'vitest';
import { T } from '@db';
import { fetchApi } from '@server/test/utils';

describe('/members', () => {
  it('should return members', async () => {
    const res = await fetchApi('members');
    expect(res.status).toBe(200);
    const dbMembers = await T.members.all();
    const apiMembers = await res.json();
    expect(apiMembers.length).toBe(dbMembers.length);
  });
});

describe('/members/:id', () => {
  it('should return member with sites and files', async () => {
    const res = await fetchApi('members/1');
    expect(res.status).toBe(200);
    const member = await res.json();
    expect(member.id).toBe(1);
    expect(member.sites).toBeInstanceOf(Array);
    expect(member.sites[0].files).toBeInstanceOf(Array);
    expect(member.sites[0].files[0].data).toBeTypeOf('string');
  });

  // it ('should return files array in site even if it has no files', async () => {

  // })
});
