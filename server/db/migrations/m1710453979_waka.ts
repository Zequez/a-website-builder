import { sql } from 'squid/pg';
import { query } from '@db/pool';

export async function up() {
  await query(sql``);
}

export async function down() {
  await query(sql``);
}
