import { env, isTest, SILENCE_SQL_LOGS } from '../config.js';
import pg from 'pg';
const { Pool } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { colorConsole } from '../lib/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = isTest ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

if (!databaseUrl) throw '(TEST_)DATABASE_URL environment variable not set';

const DATABASE_SCHEMA = fs.readFileSync(path.resolve(__dirname, './schema.sql'), 'utf8');
const DATABASE_SEEDS = fs.readFileSync(path.resolve(__dirname, './seeds.sql'), 'utf8');
const DATABASE_DROP = fs.readFileSync(path.resolve(__dirname, './drop.sql'), 'utf8');

export const pool = new Pool({
  connectionString: databaseUrl, // Connection string for your PostgreSQL database
  ssl: false,
});

function sqlLog(queryStr: string, values: any[] = []) {
  if (!SILENCE_SQL_LOGS)
    values.length ? colorConsole.green(queryStr, values) : colorConsole.green(queryStr);
}

export async function runSchema(drop: boolean = false) {
  const client = await pool.connect();
  try {
    colorConsole.greenBg('Dropping existing DB tables');
    sqlLog(DATABASE_DROP);
    await client.query(DATABASE_DROP);

    colorConsole.greenBg('Running schema');
    sqlLog(DATABASE_SCHEMA);
    await client.query(DATABASE_SCHEMA);

    console.log('');

    colorConsole.greenBg('Seeding database');
    sqlLog(DATABASE_SEEDS);
    await client.query(DATABASE_SEEDS);

    console.log('\nSchema ran successfully');
  } catch (error) {
    console.error('\nError running schema:', error);
  } finally {
    client.release();
  }
}

export async function query(queryStr: string, values: any[] = []) {
  const client = await pool.connect();
  try {
    sqlLog(queryStr, values);

    const { rows } = await client.query(queryStr, values);
    return rows;
  } catch (e) {
    console.error('[SQL Error]', e, queryStr);
    if (SILENCE_SQL_LOGS) colorConsole.red(queryStr);
    throw e;
  } finally {
    client.release();
  }
}

export type Member = {
  id: number;
  email: string;
  full_name: string;
  is_admin: string;
  active: boolean;
  passphrase: string;
  created_at: string;
};

export type Site = {
  id: number;
  name: string;
  local_name: string;
  domain_name: string;
  member_id: number;
  created_at: string;
};

export type File_ = {
  id: string;
  site_id: number;
  name: string;
  data: Buffer;
  data_type: string;
  data_size: number;
  data_cdn_url: string;
  created_at: string;
};

export type MembersSession = {
  id: string;
  member_id: number;
  token: string;
  created_at: string;
};

function select<T>(table: string) {
  const q = `SELECT * FROM ${table}`;
  return {
    all: async (): Promise<T[]> => await query(q),
    get: async (id: number | string): Promise<T> =>
      (await query(`${q} WHERE id = $1 LIMIT 1`, [id]))[0],
    insert: async (keyValues: Record<string, any>): Promise<T> =>
      (await insertQuery<T>(table, keyValues))[0],
    update: async (id: number | string, keyValues: Record<string, any>): Promise<T> => {
      const keys = Object.keys(keyValues);
      const values = Object.values(keyValues);
      const numbers = values.map((_, i) => `$${i + 1}`);
      const idNum = numbers.length + 1;
      return (
        await query(
          `UPDATE ${table} SET (${keys}) = (${numbers}) WHERE id = $${idNum} RETURNING *`,
          [...values, id],
        )
      )[0];
    },
    where: (keyValues: Record<string, any>) => {
      const whereQ = Object.keys(keyValues)
        .map((k, i) => `${k} = $${i + 1}`)
        .join(' AND ');
      const qq = `${q} WHERE ${whereQ}`;
      return {
        all: async (): Promise<T[]> => await query(qq, Object.values(keyValues)),
        one: async (): Promise<T> =>
          (await query(`${qq} LIMIT 1`, Object.values(keyValues)))[0] || null,
      };
    },
  };
}

async function insertQuery<T>(table: string, keyValues: Record<string, any>) {
  const keys = Object.keys(keyValues);
  const valuesString = keys.map((k, i) => `$${i + 1}`);
  const values = Object.values(keyValues);
  return (await query(
    `INSERT INTO ${table} (${keys}) VALUES (${valuesString}) RETURNING *`,
    values,
  )) as T[];
}

const membersSessions = select<MembersSession>('members_sessions');
const members = select<Member>('members');
const sites = select<Site>('sites');
const files = select<File_>('files');

export const T = {
  membersSessions,
  members,
  sites,
  files,
};
