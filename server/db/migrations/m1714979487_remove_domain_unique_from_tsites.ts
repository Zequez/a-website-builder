import { QQ } from '@db';

export async function up() {
  await QQ`ALTER TABLE tsites DROP CONSTRAINT tsites_domain_key;`;
  await QQ`ALTER TABLE tsites DROP CONSTRAINT tsites_subdomain_key;`;
}

export async function down() {
  await QQ``;
}
