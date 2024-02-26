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

export async function runQuery(query: string) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(query);
    return rows;
  } finally {
    client.release();
  }
}

export class Member {
  static all() {
    return runQuery('SELECT * FROM members');
  }
}

export class Site {
  static all() {
    return runQuery('SELECT * FROM sites');
  }
}

export class Page {
  static all() {
    return runQuery('SELECT * FROM pages');
  }
}
