import { migrate, rollback } from '@db/migration';

export async function setup() {
  await migrate();
}

export async function tearDown() {
  await rollback();
}
