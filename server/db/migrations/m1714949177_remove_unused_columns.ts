import { QQ } from '@db';

export async function up() {
  await QQ`ALTER TABLE tsites DROP COLUMN rendered_pages;`;
  await QQ`ALTER TABLE prerendered DROP COLUMN assets_hash_key;`;
}

export async function down() {
  await QQ``;
}
