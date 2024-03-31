import { afterAll, beforeAll } from 'vitest';
import waitPort from 'wait-port';
import { PORT } from '@server/config';
import { apply } from './fixtures';
import { preloadFixtures } from './utils';
import app from '@server/app';

let server: ReturnType<typeof app.listen>;
beforeAll(async () => {
  // console.log('BEFORE ALL SCRIPTs');
  // I realized this is never going to work because the server runs on a separate process
  // and it does queries by while the tests are running. I have no idea how to implement this; but
  // I can still truncate all tables and apply the fixtures

  // await setGlobalClient();
  // await query(sql`BEGIN`);

  server = app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
  await waitPort({ port: PORT, output: 'silent' });
  await apply();
  await preloadFixtures();
});

afterAll(async () => {
  server.close();
  // console.log('AFTER ALL');
  // await query(sql`ROLLBACK`);
  // await releaseGlobalClient();
});
