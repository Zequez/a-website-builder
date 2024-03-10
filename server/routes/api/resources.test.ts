import { describe, it, expect } from 'vitest';
import { fetchApi } from './testUtils';
import { T } from '@db';

describe('/members', () => {
  it('should return members', async () => {
    const res = await fetchApi('/members');
    expect(res.status).toBe(200);
    const dbMembers = await T.members.all();
    const apiMembers = await res.json();
    expect(apiMembers.members.length).toBe(dbMembers.length);
  });
});

describe('/sites', () => {
  it('should return sites', async () => {
    const res = await fetchApi('/sites');
    expect(res.status).toBe(200);
    const dbSites = await T.sites.all();
    const apiSites = await res.json();
    expect(apiSites.sites.length).toBe(dbSites.length);
  });
});
