import { migrate, rollback, DANGER_USE_ONLY_ON_TEST_ENVIRONMENT_reset } from '@db/migration';
import { apply } from './fixtures';

export async function setup() {
  console.log('Reseting and migrating DB');
  await DANGER_USE_ONLY_ON_TEST_ENVIRONMENT_reset();
  await migrate();
  await apply();
  return () => {
    // console.log('Rolling back DB');
  };
}
