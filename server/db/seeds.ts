import { T } from '@db';
import { hashPass } from '@server/lib/utils';

export async function apply() {
  const member = await T.members.where({ email: 'zequez@gmail.com' }).one();

  if (!member) {
    console.log('Adding first user');
    const addedMember = await T.members.insert({
      email: 'zequez@gmail.com',
      full_name: 'Ezequiel Schwartzman',
      is_admin: true,
      active: true,
      passphrase: await hashPass('123456'),
    });
    console.log(addedMember);
  } else {
    console.log('Already seeded');
  }
}
