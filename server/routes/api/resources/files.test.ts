import { describe, it, expect } from 'vitest';

import { T } from '@db';
import { randomAlphaNumericString } from '@shared/utils';
import { fetchApi } from '@server/test/utils';
import { randomEmail, tokenFromMember } from '@server/lib/utils';

describe('POST /files/:id', () => {
  it('should not update a file without the correct authentication', async () => {
    const randomNewData = randomAlphaNumericString();
    const currentFile = (await T.files.all())[0];

    const res = await fetchApi(`files/${currentFile.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: randomNewData,
        data: btoa(randomNewData),
      }),
    });
    expect(res.status).toBe(401);
  });

  it('should not update if member does not own the file', async () => {
    const newMember = await T.members.insert({
      email: randomEmail(),
      passphrase: randomAlphaNumericString(),
      full_name: randomAlphaNumericString(),
    });
    const newMemberToken = await tokenFromMember(newMember);
    const randomNewData = randomAlphaNumericString();
    const currentFile = (await T.files.all())[0];
    const res = await fetchApi(`files/${currentFile.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newMemberToken}`,
      },
      body: JSON.stringify({
        name: randomNewData,
        data: btoa(randomNewData),
      }),
    });
    expect(res.status).toBe(401);
  });

  it('should update the file', async () => {
    const randomNewData = randomAlphaNumericString();
    const currentFile = (await T.files.all())[0];

    const site = await T.sites.get(currentFile.site_id);
    const member = await T.members.get(site.member_id);

    const token = await tokenFromMember(member);

    const res = await fetchApi(`files/${currentFile.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
