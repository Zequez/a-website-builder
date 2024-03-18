import { File_, Member, T } from '@db';
import { tokenFromMember } from '@server/lib/utils';

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

async function loadMemberResources(email: string) {
  const member = await T.members.where({ email }).one();
  const sites = await T.sites.where({ member_id: member!.id }).all();
  let files: File_[] = [];
  for (let site of sites) {
    files = files.concat(await T.files.where({ site_id: site.id }).all());
  }
  return { member: member!, sites, files, token: tokenFromMember(member!) };
}

export const loadFixtures = async () => {
  return {
    bob: await loadMemberResources('bob@example.com'),
    pat: await loadMemberResources('pat@example.com'),
  };
};
