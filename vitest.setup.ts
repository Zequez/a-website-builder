import { afterAll, beforeAll } from 'vitest';
import { start, restart, close } from './server/server';
import { runSchema } from './server/db/driver';

beforeAll(async () => {
  await runSchema();
  restart();
});

afterAll(() => {
  close();
});
