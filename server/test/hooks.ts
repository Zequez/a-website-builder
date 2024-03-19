import { afterAll, beforeAll } from 'vitest';
import waitPort from 'wait-port';
import { PORT } from '@server/config';
import { apply } from './fixtures';
import { preloadFixtures } from './utils';

beforeAll(async () => {
  // console.log('BEFORE ALL SCRIPTs');
  // I realized this is never going to work because the server runs on a separate process
  // and it does queries by while the tests are running. I have no idea how to implement this; but
  // I can still truncate all tables and apply the fixtures

  // await setGlobalClient();
  // await query(sql`BEGIN`);

  await waitPort({ port: PORT, output: 'silent' });
  await apply();
  await preloadFixtures();
});

afterAll(async () => {
  // console.log('AFTER ALL');
  // await query(sql`ROLLBACK`);
  // await releaseGlobalClient();
});
