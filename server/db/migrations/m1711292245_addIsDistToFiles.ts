import { Q, sql } from '@db';

export async function up() {
  await Q(sql`
    ALTER TABLE files ADD COLUMN IF NOT EXISTS "is_dist" BOOLEAN DEFAULT false;
  `);
}

export async function down() {
  await Q(sql`
    ALTER TABLE files DROP COLUMN IF EXISTS "is_dist";
  `);
}
