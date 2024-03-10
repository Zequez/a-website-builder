import { runSchema } from '@db';

export async function setup() {
  await runSchema({ drop: true, silent: true });
}

export async function tearDown() {}
