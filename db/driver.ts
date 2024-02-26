import 'dotenv/config';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { colorConsole } from '../lib/utils';

if (!process.env.DATABASE_URL) throw 'DATABASE_URL environment variable not set';

const DATABASE_SCHEMA = fs.readFileSync(path.resolve(__dirname, './schema.sql'), 'utf8');
const DATABASE_SEEDS = fs.readFileSync(path.resolve(__dirname, './seeds.sql'), 'utf8');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Connection string for your PostgreSQL database
  ssl: false,
});

export async function runSchema() {
  const client = await pool.connect();
  try {
    colorConsole.greenBg('Running schema');
    colorConsole.green(DATABASE_SCHEMA);
    await client.query(DATABASE_SCHEMA);

    console.log('');

    colorConsole.greenBg('Seeding database');
    colorConsole.green(DATABASE_SEEDS);
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
    colorConsole.green(queryStr, values);

    const { rows } = await client.query(queryStr, values);
    return rows;
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

function select<T>(table: string) {
  const q = `SELECT * FROM ${table}`;
  return {
    all: async (): Promise<T[]> => await query(q),
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

const members = select<Member>('members');
const sites = select<Site>('sites');
const files = select<File_>('files');

export const T = {
  members,
  sites,
  files,
};
