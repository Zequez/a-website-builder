import { restart, close } from '@server/server';
import { runSchema } from '@db';

export async function setup() {
  await runSchema({ drop: true, silent: true });
  await restart();
}

export async function tearDown() {
  await close();
}
