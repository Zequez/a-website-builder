import { describe, it, expect } from 'vitest';

import { T } from '@db';
import { randomAlphaNumericString, uuid } from '@shared/utils';
import { post, put, delete_, get, fixtures as F } from '@server/test/utils';

describe('GET /files', () => {
  it('should get all the files by the given member', async () => {
    const res = await get(`files?member_id=${F.bob.member.id}`);
    expect(res.status).toEqual(200);
    const data = await res.json();
    expect(data.length).toEqual(2);
  });
});

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
    const randomNewData = randomAlphaNumericString();
    const currentFile = F.bob.files[0];
    const res = await put(
      `files/${currentFile.id}`,
      {
        name: randomNewData,
        data: btoa(randomNewData),
      },
      F.pat.token,
    );

    expect(res.status).toBe(401);
  });

  it('should update the file', async () => {
    const randomNewData = randomAlphaNumericString();
    const currentFile = F.bob.files[0];
    const res = await put(
      `files/${currentFile.id}`,
      {
        name: randomNewData,
        data: btoa(randomNewData),
      },
      F.bob.token,
    );

    expect(res.status).toBe(200);
    const dbFile = await T.files.get(currentFile.id);
    expect(dbFile!.data.toString()).toEqual(randomNewData);
    expect(parseInt(dbFile!.data_size)).toEqual(randomNewData.length);
  });

  it('should not update a file with an empty name', async () => {
    const currentFile = F.bob.files[0];
    const res = await put(
      `files/${currentFile.id}`,
      {
        name: '',
        data: btoa(randomAlphaNumericString()),
      },
      F.bob.token,
    );
    expect(res.status).toBe(400);
  });

  it('should not update a file with a name taken by another file', async () => {
    const existingFileName = randomAlphaNumericString();
    const currentFile = F.bob.files[0];
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
      F.bob.token,
    );
    expect(res.status).toBe(409);
  });

  it('should update a file without changing the name', async () => {
    const currentFile = F.bob.files[0];
    const res = await put(
      `files/${currentFile!.id}`,
      {
        name: currentFile!.name,
        data: btoa(randomAlphaNumericString()),
      },
      F.bob.token,
    );
    expect(res.status).toBe(200);
  });
});

describe('POST /files', () => {
  it('should create a new file with the given UUID', async () => {
    const newUuid = uuid();
    const res = await post(
      'files',
      {
        name: randomAlphaNumericString(),
        data: btoa(randomAlphaNumericString()),
        site_id: F.bob.sites[0].id,
        id: newUuid,
      },
      F.bob.token,
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.site_id).toEqual(F.bob.sites[0].id);
    expect(data.id).toEqual(newUuid);
  });

  it('should not create a new file without the correct authentication', async () => {
    const randomNewData = randomAlphaNumericString();
    const res = await post('files', {
      name: randomNewData,
      data: btoa(randomNewData),
    });
    expect(res.status).toBe(401);
  });

  it('should not create a new file without a site ID', async () => {
    const randomNewData = randomAlphaNumericString();
    const res = await post(
      'files',
      {
        name: randomNewData,
        data: btoa(randomNewData),
      },
      F.bob.token,
    );
    expect(res.status).toBe(400);
  });

  it('should not create a new file for a site that does not exist', async () => {
    const randomNewData = randomAlphaNumericString();
    const res = await post(
      'files',
      {
        site_id: uuid(),
        name: randomNewData,
        data: btoa(randomNewData),
      },
      F.bob.token,
    );
    expect(res.status).toBe(400);
  });

  it('should not create a new file for a site not owned by the member', async () => {
    const randomNewData = randomAlphaNumericString();
    const site = F.bob.sites[0];
    const res = await post(
      'files',
      {
        site_id: site.id,
        name: randomNewData,
        data: btoa(randomNewData),
      },
      F.pat.token,
    );
    expect(res.status).toBe(401);
  });

  it('should not create a new file without a name', async () => {
    const randomNewData = randomAlphaNumericString();
    const site = F.bob.sites[0];
    const res = await post(
      'files',
      {
        name: '',
        site_id: site!.id,
        data: btoa(randomNewData),
      },
      F.bob.token,
    );
    expect(res.status).toBe(400);
  });

  it('should not create a new file with a name that already exists', async () => {
    const randomNewData = randomAlphaNumericString();
    const site = F.bob.sites[0];
    const res = await post(
      'files',
      {
        name: randomNewData,
        site_id: site!.id,
        data: btoa(randomNewData),
      },
      F.bob.token,
    );
    expect(res.status).toBe(201);
    const res2 = await post(
      'files',
      {
        name: randomNewData,
        site_id: site!.id,
        data: btoa(randomNewData),
      },
      F.bob.token,
    );
    expect(res2.status).toBe(409);
  });

  it('should not create a new file with a name that already exists case-insensitive', async () => {
    const randomNewData = randomAlphaNumericString();
    const site = F.bob.sites[0];
    const res = await post(
      'files',
      {
        name: randomNewData,
        site_id: site!.id,
        data: btoa(randomNewData),
      },
      F.bob.token,
    );
    expect(res.status).toBe(201);
    const res2 = await post(
      'files',
      {
        name: randomNewData.toUpperCase(),
        site_id: site!.id,
        data: btoa(randomNewData),
      },
      F.bob.token,
    );
    expect(res2.status).toBe(409);
  });
});

describe('DELETE /files', () => {
  it('should delete a file', async () => {
    const res = await delete_(`files/${F.bob.files[0].id}`, {}, F.bob.token);
    expect(res.status).toBe(200);
    const nullFile = await T.files.get(F.bob.files[0].id);
    expect(nullFile).toBe(null);
  });

  it('should not delete a file owned by a different member', async () => {
    const res = await delete_(`files/${F.pat.files[0].id}`, {}, F.bob.token);
    expect(res.status).toBe(401);
  });

  it('should indicate that a file does not exist', async () => {
    const res = await delete_(`files/${uuid()}`, {}, F.bob.token);
    expect(res.status).toBe(404);
  });
});

describe('POST /files/saveBuild', () => {
  it('should save all the build files for the given site', async () => {
    const res = await post(
      `files/saveBuild`,
      { siteId: F.bob.sites[0].id, files: [{ name: 'index.html', data: btoa('Hello world') }] },
      F.bob.token,
    );
    expect(res.status).toBe(200);
    const storedBuildFiles = await T.files
      .where({ is_dist: true, site_id: F.bob.sites[0].id })
      .all();
    expect(storedBuildFiles.length).toBe(1);
    expect(storedBuildFiles[0].data.toString()).toBe('Hello world');
  });

  it('should delete exiting built files', async () => {
    const res = await post(
      `files/saveBuild`,
      { siteId: F.bob.sites[0].id, files: [{ name: 'index.html', data: btoa('Hello world') }] },
      F.bob.token,
    );
    expect(res.status).toBe(200);
    const res2 = await post(
      `files/saveBuild`,
      { siteId: F.bob.sites[0].id, files: [{ name: 'index.html', data: btoa('Hello world2') }] },
      F.bob.token,
    );
    expect(res2.status).toBe(200);
    const storedBuildFiles = await T.files
      .where({ is_dist: true, site_id: F.bob.sites[0].id })
      .all();
    expect(storedBuildFiles.length).toBe(1);
    expect(storedBuildFiles[0].data.toString()).toBe('Hello world2');
  });

  it('should not deploy to a site from another member', async () => {
    const res = await post(
      `files/saveBuild`,
      { siteId: F.pat.sites[0].id, files: [] },
      F.bob.token,
    );
    expect(res.status).toEqual(401);
  });
});
