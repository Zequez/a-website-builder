import { describe, it, expect, beforeAll } from 'vitest';
import { T } from '@db';
import { randomAlphaNumericString, uuid } from '@shared/utils';
import { tokenFromMember } from '@server/lib/utils';
import { get, post, fixtures as F, delete_ } from '@server/test/utils';

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
  it('should use the provided UUID', async () => {
    const name = randomAlphaNumericString();
    const localName = randomAlphaNumericString();
    const newUuid = uuid();
    const res = await post(`sites`, { name, localName, id: newUuid }, F.bob.token);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty('id', newUuid);
    expect(data).toHaveProperty('name', name);
    expect(data).toHaveProperty('local_name', localName);
    expect(data).toHaveProperty('created_at');
  });

  it('should fail if the site with that UUID already exists', async () => {
    const name = randomAlphaNumericString();
    const newUuid = uuid();
    const res = await post(
      `sites`,
      { name, localName: randomAlphaNumericString(), id: newUuid },
      F.bob.token,
    );
    expect(res.status).toBe(201);
    const res2 = await post(
      `sites`,
      { name, localName: randomAlphaNumericString(), id: newUuid },
      F.bob.token,
    );
    expect(res2.status).toBe(409);
  });

  it('should generate a UUID if none is provided', async () => {
    const name = randomAlphaNumericString();
    const localName = randomAlphaNumericString();
    const res = await post(`sites`, { name, localName }, F.bob.token);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name', name);
    expect(data).toHaveProperty('local_name', localName);
    expect(data).toHaveProperty('created_at');
  });

  it('should fail with invalid UUID', async () => {
    const name = randomAlphaNumericString();
    const localName = randomAlphaNumericString();
    const res = await post(`sites`, { name, localName, id: 'invalid' }, F.bob.token);
    expect(res.status).toBe(400);
  });

  it('should create a new site for the current member', async () => {
    const name = randomAlphaNumericString();
    const localName = randomAlphaNumericString();
    const res = await post(`sites`, { name, localName }, F.bob.token);
    expect(res.status).toBe(201);
    const site = await res.json();
    expect(site).toHaveProperty('id');
    expect(site).toHaveProperty('name', name);
    expect(site).toHaveProperty('local_name', localName);
    expect(site).toHaveProperty('created_at');
    expect(site).toHaveProperty('member_id', F.bob.member.id);
  });

  it('should not create new site without authorization', async () => {
    const name = randomAlphaNumericString();
    const localName = randomAlphaNumericString();
    const res = await post(`sites`, { name, localName }, '');
    expect(res.status).toBe(401);
  });
});

describe('DELETE /sites/:id', () => {
  it('should delete the site', async () => {
    const member = (await T.members.all())[0];
    const token = await tokenFromMember(member);
    const site = (await T.sites.all())[0];
    const res = await delete_(`sites/${site.id}`, {}, token);
    expect(res.status).toBe(200);
  });

  it('should not delete the site without authorization', async () => {
    const site = (await T.sites.all())[0];
    const res = await delete_(`sites/${site.id}`, {}, '');
    expect(res.status).toBe(401);
  });

  it('should not delete the site that does not exist', async () => {
    const member = (await T.members.all())[0];
    const token = await tokenFromMember(member);
    const res = await delete_(`sites/${uuid()}`, {}, token);
    expect(res.status).toBe(404);
  });

  it('should not delete the site that does not belong to the current member', async () => {
    const site = (await T.sites.all())[0];
    const member = (await T.members.all())[1];
    const token = await tokenFromMember(member);
    const res = await delete_(`sites/${site.id}`, {}, token);
    expect(res.status).toBe(403);
  });
});
