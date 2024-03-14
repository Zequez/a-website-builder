import '../config';
import pg from 'pg';
const { Pool } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { groupBy } from '@shared/utils';

import { isTest, SILENCE_SQL_LOGS } from '../config.js';
import { colorConsole, updateFileToB64 } from '../lib/utils.js';
import { Member, Site, File_ } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = isTest ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

if (!databaseUrl) throw '(TEST_)DATABASE_URL environment variable not set';

const DATABASE_SCHEMA = fs.readFileSync(path.join(__dirname, './schema.sql'), 'utf8');
const DATABASE_SEEDS = fs.readFileSync(path.join(__dirname, './seeds.sql'), 'utf8');
const DATABASE_DROP = fs.readFileSync(path.join(__dirname, './drop.sql'), 'utf8');

export const pool = new Pool({
  connectionString: databaseUrl, // Connection string for your PostgreSQL database
  ssl: false,
});

function sqlLog(queryStr: string, values: any[] = []) {
  if (!SILENCE_SQL_LOGS)
    values.length ? colorConsole.green(queryStr, values) : colorConsole.green(queryStr);
}

export async function runSchema(config?: { drop: boolean; silent: boolean }) {
  const { drop = false, silent = false } = config || {};

  const client = await pool.connect();
  try {
    if (drop) {
      if (!silent) {
        colorConsole.greenBg('Dropping existing DB tables');
        sqlLog(DATABASE_DROP);
      }
      await client.query(DATABASE_DROP);
    }

    if (!silent) {
      colorConsole.greenBg('Running schema');
      sqlLog(DATABASE_SCHEMA);
    }
    await client.query(DATABASE_SCHEMA);

    if (!silent) console.log('');

    if (!silent) {
      colorConsole.greenBg('Seeding database');
      sqlLog(DATABASE_SEEDS);
    }
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

function select<T>(table: string) {
  const q = `SELECT * FROM ${table}`;
  return {
    one: async (): Promise<T | null> => (await query(`${q} LIMIT 1`))[0],
    all: async (): Promise<T[]> => await query(q),
    get: async (id: number | string): Promise<T | null> =>
      (await query(`${q} WHERE id = $1 LIMIT 1`, [id]))[0] || null,
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
    delete: async (id: number | string) => await query(`DELETE FROM ${table} WHERE id = $1`, [id]),
    where: (keyValues: Record<string, any>) => {
      const whereQ = Object.keys(keyValues)
        .map((k, i) => `${k} = $${i + 1}`)
        .join(' AND ');
      const qq = `${q} WHERE ${whereQ}`;
      return {
        all: async (): Promise<T[]> => await query(qq, Object.values(keyValues)),
        one: async (): Promise<T | null> =>
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

const members = select<Member>('members');
const sites = select<Site>('sites');
const files = select<File_>('files');

export type FileB64 = Omit<File_, 'data' | 'data_size'> & {
  data: string;
  data_size: number;
};
export type SiteWithFiles = Site & { files: FileB64[] };

const extendedMembers = {
  ...members,
  withSitesAndFiles: async (id: string) => {
    const member = await T.members.get(id);
    if (!member) return null;
    const sites = await T.sites.where({ member_id: member.id }).all();
    const sitesIds = sites.map((s) => s.id);
    const files = (await query(`SELECT * FROM files WHERE site_id IN (${sitesIds})`)) as File_[];
    const editedFiles = files.map(updateFileToB64);
    const filesBySiteId = groupBy(editedFiles, 'site_id');
    (sites as SiteWithFiles[]).forEach((s) => (s.files = filesBySiteId[s.id] || []));
    return { ...member, sites };
  },
};

const extendedFiles = {
  ...files,
  findExisting: async (siteId: string | number, name: string): Promise<File_ | null> => {
    return (
      (
        await query(`SELECT * FROM files WHERE site_id = $1 AND name ILIKE $2`, [siteId, name])
      )[0] || null
    );
  },
};

export const T = {
  members: extendedMembers,
  sites,
  files: extendedFiles,
};
