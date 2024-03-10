import { describe, it, expect } from 'vitest';
import { fetchApi } from './testUtils';
import { T } from '@db';
import { randomAlphaNumericString } from '@app/components/Editor/lib/utils';

describe('/members', () => {
  it('should return members', async () => {
    const res = await fetchApi('/members');
    expect(res.status).toBe(200);
    const dbMembers = await T.members.all();
    const apiMembers = await res.json();
    expect(apiMembers.length).toBe(dbMembers.length);
  });
});

describe('/members/:id', () => {
  it('should return member with sites and files', async () => {
    const res = await fetchApi('/members/1');
    expect(res.status).toBe(200);
    const member = await res.json();
    expect(member.id).toBe(1);
    expect(member.sites).toBeInstanceOf(Array);
    expect(member.sites[0].files).toBeInstanceOf(Array);
    expect(member.sites[0].files[0].data).toBeTypeOf('string');
  });
});

describe('/sites', () => {
  it('should return sites', async () => {
    const res = await fetchApi('/sites');
    expect(res.status).toBe(200);
    const dbSites = await T.sites.all();
    const apiSites = await res.json();
    expect(apiSites.length).toBe(dbSites.length);
  });
});

describe('POST /files/:id', () => {
  it('should update the file', async () => {
    const randomNewData = randomAlphaNumericString();
    const currentFile = (await T.files.all())[0];

    const res = await fetchApi(`/files/${currentFile.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: randomNewData,
        data: btoa(randomNewData),
      }),
    });
    expect(res.status).toBe(200);
    const dbFile = await T.files.get(currentFile.id);
    expect(dbFile.data.toString()).toEqual(randomNewData);
    expect(parseInt(dbFile.data_size)).toEqual(randomNewData.length);
  });
});
