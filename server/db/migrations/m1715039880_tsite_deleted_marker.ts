import { QQ } from '@db';

export async function up() {
  await QQ`ALTER TABLE tsites ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;`;
}

export async function down() {
  await QQ`ALTER TABLE tsites DROP COLUMN deleted_at;`;
}
