import { describe, it, expect } from 'vitest';
import { T } from '@db';
import { randomAlphaNumericString } from '@shared/utils';
import { tokenFromMember } from '@server/lib/utils';
import { get, post } from '@server/test/utils';

describe('GET /sites', () => {
  it('should return sites', async () => {
    const res = await get('sites');
    expect(res.status).toBe(200);
    const dbSites = await T.sites.all();
    const apiSites = await res.json();
    expect(apiSites.length).toBe(dbSites.length);
  });
});

describe('POST /sites', () => {
  it('should create a new site for the current member', async () => {
    const member = (await T.members.all())[0];
    const token = await tokenFromMember(member);
    const name = randomAlphaNumericString();
    const localName = randomAlphaNumericString();
    const res = await post(`sites`, { name, localName }, token);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name', name);
    expect(data).toHaveProperty('local_name', localName);
    expect(data).toHaveProperty('created_at');
  });

  it('should not create new site without authorization', async () => {
    const name = randomAlphaNumericString();
    const localName = randomAlphaNumericString();
    const res = await post(`sites`, { name, localName }, '');
    expect(res.status).toBe(401);
  });
});
