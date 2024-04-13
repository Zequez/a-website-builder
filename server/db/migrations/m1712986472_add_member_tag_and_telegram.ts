import { Q, sql } from '@db';

export async function up() {
  await Q(sql`
    ALTER TABLE members
    ADD COLUMN tag VARCHAR(32) DEFAULT NULL UNIQUE,
    ADD COLUMN telegram_handle VARCHAR(32) DEFAULT NULL UNIQUE;
  `);
}

export async function down() {
  await Q(sql``);
}
