import { describe, it, expect } from 'vitest';

import { T } from '@db';
import { randomAlphaNumericString, uuid } from '@shared/utils';
import { post, put, delete_ } from '@server/test/utils';
import { randomEmail, tokenFromMember } from '@server/lib/utils';

describe('PUT /files/:id', () => {
  it('should not update a file without the correct authentication', async () => {
    const randomNewData = randomAlphaNumericString();
    const currentFile = (await T.files.all())[0];
    const res = await put(`files/${currentFile.id}`, {
      name: randomNewData,
      data: btoa(randomNewData),
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
    const res = await put(
      `files/${currentFile.id}`,
      {
        name: randomNewData,
        data: btoa(randomNewData),
      },
      newMemberToken,
    );

    expect(res.status).toBe(401);
  });

  it('should update the file', async () => {
    const randomNewData = randomAlphaNumericString();
    const currentFile = (await T.files.all())[0];

    const site = await T.sites.get(currentFile.site_id);
    const member = await T.members.get(site!.member_id);
    const token = await tokenFromMember(member!);
    const res = await put(
      `files/${currentFile.id}`,
      {
        name: randomNewData,
        data: btoa(randomNewData),
      },
      token,
    );

    expect(res.status).toBe(200);
    const dbFile = await T.files.get(currentFile.id);
    expect(dbFile!.data.toString()).toEqual(randomNewData);
    expect(parseInt(dbFile!.data_size)).toEqual(randomNewData.length);
  });

  it('should not update a file with an empty name', async () => {
    const token = await tokenFromMember((await T.members.one())!);
    const currentFile = (await T.files.all())[0];
    const res = await put(
      `files/${currentFile.id}`,
      {
        name: '',
        data: btoa(randomAlphaNumericString()),
      },
      token,
    );
    expect(res.status).toBe(400);
  });

  it('should not update a file with a name taken by another file', async () => {
    const token = await tokenFromMember((await T.members.one())!);

    const existingFileName = randomAlphaNumericString();
    const currentFile = await T.files.one();
    await T.files.insert({
      site_id: currentFile!.site_id,
      name: existingFileName,
      data: '',
    });
    const res = await put(
      `files/${currentFile!.id}`,
      {
        name: existingFileName,
        data: btoa(randomAlphaNumericString()),
      },
      token,
    );
    expect(res.status).toBe(409);
  });

  it('should update a file without changing the name', async () => {
    const token = await tokenFromMember((await T.members.one())!);

    const currentFile = await T.files.one();
    const res = await put(
      `files/${currentFile!.id}`,
      {
        name: currentFile!.name,
        data: btoa(randomAlphaNumericString()),
      },
      token,
    );
    expect(res.status).toBe(200);
  });
});

describe('POST /files', () => {
  it('should not create a new file without the correct authentication', async () => {
    const randomNewData = randomAlphaNumericString();
    const res = await post('files', {
      name: randomNewData,
      data: btoa(randomNewData),
    });
    expect(res.status).toBe(401);
  });

  it('should not create a new file without a site ID', async () => {
    const member = await T.members.one();
    const token = await tokenFromMember(member!);
    const randomNewData = randomAlphaNumericString();
    const res = await post(
      'files',
      {
        name: randomNewData,
        data: btoa(randomNewData),
      },
      token,
    );
    expect(res.status).toBe(400);
  });

  it('should not create a new file for a site that does not exist', async () => {
    const member = await T.members.one();
    const token = await tokenFromMember(member!);
    const randomNewData = randomAlphaNumericString();
    const res = await post(
      'files',
      {
        site_id: uuid(),
        name: randomNewData,
        data: btoa(randomNewData),
      },
      token,
    );
    expect(res.status).toBe(400);
  });

  it('should not create a new file for a site not owned by the member', async () => {
    const newMember = await T.members.insert({
      email: randomEmail(),
      passphrase: randomAlphaNumericString(),
      full_name: randomAlphaNumericString(),
    });
    const newMemberToken = await tokenFromMember(newMember);
    const randomNewData = randomAlphaNumericString();
    const site = (await T.sites.all())[0];
    const res = await post(
      'files',
      {
        site_id: site.id,
        name: randomNewData,
        data: btoa(randomNewData),
      },
      newMemberToken,
    );
    expect(res.status).toBe(401);
  });

  it('should not create a new file without a name', async () => {
    const member = await T.members.one();
    const token = await tokenFromMember(member!);
    const randomNewData = randomAlphaNumericString();
    const site = await T.sites.where({ member_id: member!.id }).one();
    const res = await post(
      'files',
      {
        name: '',
        site_id: site!.id,
        data: btoa(randomNewData),
      },
      token,
    );
    expect(res.status).toBe(400);
  });

  it('should not create a new file with a name that already exists', async () => {
    const member = await T.members.one();
    const token = await tokenFromMember(member!);
    const randomNewData = randomAlphaNumericString();
    const site = await T.sites.where({ member_id: member!.id }).one();
    const res = await post(
      'files',
      {
        name: randomNewData,
        site_id: site!.id,
        data: btoa(randomNewData),
      },
      token,
    );
    expect(res.status).toBe(201);
    const res2 = await post(
      'files',
      {
        name: randomNewData,
        site_id: site!.id,
        data: btoa(randomNewData),
      },
      token,
    );
    expect(res2.status).toBe(409);
  });

  it('should not create a new file with a name that already exists case-insensitive', async () => {
    const member = await T.members.one();
    const token = await tokenFromMember(member!);
    const randomNewData = randomAlphaNumericString();
    const site = await T.sites.where({ member_id: member!.id }).one();
    const res = await post(
      'files',
      {
        name: randomNewData,
        site_id: site!.id,
        data: btoa(randomNewData),
      },
      token,
    );
    expect(res.status).toBe(201);
    const res2 = await post(
      'files',
      {
        name: randomNewData.toUpperCase(),
        site_id: site!.id,
        data: btoa(randomNewData),
      },
      token,
    );
    expect(res2.status).toBe(409);
  });
});

describe('DELETE /files', () => {
  it('should delete a file', async () => {
    const member = await T.members.one();
    const token = await tokenFromMember(member!);
    const site = await T.sites.where({ member_id: member!.id }).one();
    const file = await T.files.insert({
      site_id: site!.id,
      name: randomAlphaNumericString(),
      data: '',
    });
    const res = await delete_(`files/${file!.id}`, {}, token);
    expect(res.status).toBe(204);
    const nullFile = await T.files.get(file.id);
    expect(nullFile).toBe(null);
  });

  it('should not delete a file owned by a different member', async () => {
    const ownerMember = await T.members.one();
    const newMember = await T.members.insert({
      email: randomEmail(),
      passphrase: randomAlphaNumericString(),
      full_name: randomAlphaNumericString(),
    });
    const token = await tokenFromMember(newMember!);
    const site = await T.sites.where({ member_id: ownerMember!.id }).one();
    const file = await T.files.insert({
      site_id: site!.id,
      name: randomAlphaNumericString(),
      data: '',
    });
    const res = await delete_(`files/${file!.id}`, {}, token);
    expect(res.status).toBe(401);
  });

  it('should indicate that a file does not exist', async () => {
    const member = await await T.members.one();
    const token = await tokenFromMember(member!);
    const res = await delete_(`files/${uuid()}`, {}, token);
    expect(res.status).toBe(404);
  });
});
