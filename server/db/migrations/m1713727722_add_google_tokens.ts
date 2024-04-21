import { Q, sql } from '@db';

export async function up() {
  await Q(sql`
    ALTER TABLE members ADD COLUMN IF NOT EXISTS "google_tokens" JSONB DEFAULT NULL;
  `);
}

export async function down() {
  await Q(sql``);
}
