import { afterAll, beforeAll } from 'vitest';
import waitPort from 'wait-port';
import { PORT } from '@server/server';

beforeAll(async () => {
  // Wait until server is available on port 3123
  await waitPort({ port: PORT, output: 'silent' });
});
