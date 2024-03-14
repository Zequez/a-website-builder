import '../config';
import pg from 'pg';
import { isTest, isProd, isDev, SILENCE_SQL_LOGS } from '../config';
// import { colorConsole } from '../lib/utils.js';

const databaseUrl = isTest
  ? process.env.TEST_DATABASE_URL
  : isProd
  ? process.env.PROD_DATABASE_URL
  : isDev
  ? process.env.DEV_DATABASE_URL
  : process.env.DEV_DATABASE_URL;

if (!databaseUrl) throw '(DEV|TEST|PROD)_DATABASE_URL environment variable not set';

// function sqlLog(queryStr: any, values: any[] = []) {
//   if (!SILENCE_SQL_LOGS)
//     values.length
//       ? colorConsole.green(queryStr.toString(), values)
//       : colorConsole.green(queryStr.toString());
// }

const pool = new pg.Pool({
  connectionString: databaseUrl, // Connection string for your PostgreSQL database
  ssl: false,
});

// export async function connection(cb: (pool: PoolClient) => void) {
//   const client = await pool.connect();
//   cb(client);
//   client.release();
// }

export async function query<T>(queryConfig: pg.QueryConfig) {
  const client = await pool.connect();
  try {
    if (!SILENCE_SQL_LOGS) console.log(queryConfig);
    const { rows } = await client.query(queryConfig);
    return rows as T[];
  } catch (e) {
    console.error('[SQL Error]', e, queryConfig);
    throw e;
  } finally {
    client.release();
  }
}

export default pool;
