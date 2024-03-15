import { migrate, rollback } from '@db/migration';
import { apply } from './fixtures';

export async function setup() {
  console.log('Migrating DB');
  await migrate();
  await apply();
  return () => {
    console.log('Rolling back DB');
    return rollback();
  };
}
