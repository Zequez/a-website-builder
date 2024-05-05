import { QQ } from '@db';

export async function up() {
  await QQ`ALTER TABLE tsites ADD COLUMN IF NOT EXISTS deploy_config JSONB`;
}

export async function down() {
  await QQ`ALTER TABLE tsites DROP COLUMN deploy_config`;
}
