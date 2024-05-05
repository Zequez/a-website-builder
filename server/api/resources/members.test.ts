import { describe, it, expect, beforeEach } from 'vitest';
import { T } from '@db';
import { post, put, delete_, get, patch, fixtures as F } from '@server/test/utils';
import { randANS } from '@shared/utils';
import { hashCompare, QS } from '@server/lib/utils';

describe('/members', () => {
  it('should return members', async () => {
    const res = await get('members');
    expect(res.status).toBe(200);
    const dbMembers = await T.members.all();
    const apiMembers = await res.json();
    expect(apiMembers.length).toBe(dbMembers.length);
  });
});

describe('/members/:id', () => {
  it('should return member', async () => {
    const res = await get(`members/${F.bob.member.id}`);
    expect(res.status).toBe(200);
    const member = await res.json();
    expect(member.id).toBe(1);
  });
});

describe('PATCH /members/:id', () => {
  const patchBob = (body: any) => patch(`members/${F.bob.member.id}`, body, F.bob.token);
  const getBob = () => T.members.get(F.bob.member.id);
  const resetBobTag = () =>
    T.members.update(F.bob.member.id, { tag: null, passphrase: F.bob.member.passphrase });
  const randTag = () => 'a' + randANS().slice(0, 32);

  beforeEach(async () => {
    await resetBobTag();
  });

  // AUTHORIZATION

  it('should not update a member that is not itself', async () => {
    expect(
      (await patch(`members/${F.bob.member.id}`, { full_name: randANS() }, F.pat.token)).status,
    ).toBe(403);
  });

  // FULL NAME

  it('should update member full_name', async () => {
    const full_name = randANS();
    expect((await patchBob({ full_name })).status).toBe(200);
    expect(await getBob()).toHaveProperty('full_name', full_name);
  });

  it.each([Array.from({ length: 101 }, () => 'a').join('')])(
    'should not allow invalid full name %s',
    async (full_name) => {
      expect((await patchBob({ full_name })).status).toBe(400);
    },
  );

  // TAGS

  it('should update member tags', async () => {
    const tag = randTag();
    expect((await patchBob({ tag })).status).toBe(200);
    expect(await getBob()).toHaveProperty('tag', tag);
  });

  it.each(['', '123', 'ab', 'ar__ss', '_tsrt_', 'aaaa_aaaa_aaaa_aaaa_aaaa_aaaa_aaa'])(
    'should not allow invalid tag %s',
    async (tag) => {
      expect((await patchBob({ tag })).status).toBe(400);
    },
  );

  it.each(['asb', 'ars_rasar', 'a42', 'aaaa_aaaa_aaaa_aaaa_aaaa_aaaa_aa'])(
    'should allow edge cases tag %s',
    async (tag) => {
      expect((await patchBob({ tag })).status).toBe(200);
    },
  );

  it('should not update member tag if already set', async () => {
    expect((await patchBob({ tag: randTag() })).status).toBe(200);
    expect((await patchBob({ tag: randTag() })).status).toBe(400);
  });

  it('should not update member tag if another member has it', async () => {
    const tag = randTag();
    await T.members.update(F.pat.member.id, { tag });
    expect((await patchBob({ tag })).status).toBe(400);
  });

  // TELEGRAM HANDLE

  it('should update telegram handle', async () => {
    const telegram_handle = randANS();
    expect((await patchBob({ telegram_handle })).status).toBe(200);
    expect(await getBob()).toHaveProperty('telegram_handle', telegram_handle);
  });

  it.each(['arst', 'aaaa_aaaa_aaaa_aaaa_aaaa_aaaa_aaa', 'ars%s'])(
    'should not allow invalid telegram handle %s',
    async (telegram_handle) => {
      expect((await patchBob({ telegram_handle })).status).toBe(400);
    },
  );

  it('should not update member telegram handle if another member has it', async () => {
    const telegram_handle = randTag();
    await T.members.update(F.pat.member.id, { telegram_handle });
    expect((await patchBob({ telegram_handle })).status).toBe(400);
  });

  it('should not throw an error if the handle is the same', async () => {
    const telegram_handle = randTag();
    expect((await patchBob({ telegram_handle })).status).toBe(200);
    expect((await patchBob({ telegram_handle })).status).toBe(200);
  });

  // PASSWORD

  it('should update the password', async () => {
    const newPassword = randANS();
    expect((await patchBob({ password: newPassword, currentPassword: 'bob123' })).status).toBe(200);
    const dbPass = (await getBob())!.passphrase;
    expect(await hashCompare(newPassword, dbPass)).toEqual(true);
  });

  it.each(['arsts'])('should not allow invalid password %s', async (password) => {
    expect((await patchBob({ password })).status).toBe(400);
  });

  it('should not update password without providing the current password', async () => {
    const newPassword = randANS();
    expect((await patchBob({ password: newPassword })).status).toBe(400);
  });

  it('should not update password without providing the correct current password', async () => {
    const newPassword = randANS();
    expect((await patchBob({ password: newPassword, currentPassword: 'wrong' })).status).toBe(400);
  });

  // SUBSCRIBED TO NEWSLETTER

  it('should update the subscribed_to_newsletter flag', async () => {
    expect((await patchBob({ subscribed_to_newsletter: true })).status).toBe(200);
    expect(await getBob()).toHaveProperty('subscribed_to_newsletter', true);
    expect((await patchBob({ subscribed_to_newsletter: false })).status).toBe(200);
    expect(await getBob()).toHaveProperty('subscribed_to_newsletter', false);
  });
});

describe('GET /members/availability', () => {
  it.only.each([
    ['email', 'bob@ars.com'],
    ['telegram_handle', 'potato'],
    ['tag', 'ababa'],
  ])('should return availability for %s', async (prop, value) => {
    await T.members.update(F.bob.member.id, { [prop]: value });
    const res = await get(`members/availability?${QS({ [prop]: value })}`);
    const data = await res.json();
    expect(data[prop]).toBe(false);
  });

  it.only.each([
    ['email', 'bob@ars.com'],
    ['telegram_handle', 'potato'],
    ['tag', 'ababa'],
  ])('should return availability for %s as true when providing member ID', async (prop, value) => {
    await T.members.update(F.bob.member.id, { [prop]: value });
    const res = await get(`members/availability?${QS({ id: F.bob.member.id, [prop]: value })}`);
    const data = await res.json();
    expect(data[prop]).toBe(true);
  });
});
