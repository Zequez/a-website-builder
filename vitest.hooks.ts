import { afterAll, beforeAll } from 'vitest';
import waitPort from 'wait-port';
import { PORT } from '@server/server';

beforeAll(async () => {
  await waitPort({ port: PORT, output: 'dots' });
});
