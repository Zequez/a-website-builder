import '../config';
import pg from 'pg';
import { appEnv, SILENCE_SQL_LOGS, isProd } from '../config';
import { colorConsole } from '../lib/utils.js';

const databaseUrl = {
  dev: process.env.DEV_DATABASE_URL,
  test: process.env.TEST_DATABASE_URL,
  prod: process.env.PROD_DATABASE_URL,
}[appEnv];

if (!databaseUrl) throw '(DEV|TEST|PROD)_DATABASE_URL environment variable not set';

// function sqlLog(queryStr: any, values: any[] = []) {
//   if (!SILENCE_SQL_LOGS)
//     values.length
//       ? colorConsole.green(queryStr.toString(), values)
//       : colorConsole.green(queryStr.toString());
// }

const pool = new pg.Pool({
  connectionString: databaseUrl, // Connection string for your PostgreSQL database
  ssl: isProd ? true : false,
});

export async function setGlobalClient() {
  (global as any).GLOBAL_PG_CLIENT = (await pool.connect()) as pg.PoolClient;
}

export function releaseGlobalClient() {
  const globalClient = (global as any).GLOBAL_PG_CLIENT as pg.PoolClient | undefined;
  if (globalClient) globalClient.release();
  delete (global as any).GLOBAL_PG_CLIENT;
}

export async function query<T>(queryConfig: pg.QueryConfig) {
  const globalClient = (global as any).GLOBAL_PG_CLIENT as pg.PoolClient | undefined;
  const client = globalClient || (await pool.connect());
  try {
    if (!SILENCE_SQL_LOGS) {
      colorConsole.green(queryConfig.text);
      console.log(queryConfig.values);
    }
    const { rows } = await client.query(queryConfig);
    return rows as T[];
  } catch (e) {
    console.error('[SQL Error]', e, queryConfig);
    throw e;
  } finally {
    if (!globalClient) client.release();
  }
}

export default pool;
