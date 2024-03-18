import { T } from '@db';

export async function apply() {
  await T.members.truncate();
  await T.sites.truncate();
  await T.files.truncate();

  const bob = await T.members.insert({
    email: 'bob@example.com',
    passphrase: 'bob123',
    full_name: 'Bob Example',
  });

  const pat = await T.members.insert({
    email: 'pat@example.com',
    passphrase: 'pat123',
    full_name: 'Pat Example',
  });

  const bobSite1 = await T.sites.insert({
    name: 'Personal Website',
    local_name: 'example.com',
    member_id: bob.id,
  });

  const bobSite1File = await T.files.insert({
    name: 'index.html',
    data: 'Hello World!',
    data_size: 11,
    site_id: bobSite1.id,
  });

  return { bob, pat, bobSite1, bobSite1File };
}

export const records = {
  bob: async () => await T.members.find(1),
  bobSite1: async () => await T.sites.one(),
  bobSite1File: async () => await T.files.one(),
  pat: async () => await T.members.find(2),
};
