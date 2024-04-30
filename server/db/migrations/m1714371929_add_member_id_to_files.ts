import { Q, sql, T } from '@db';

export async function up() {
  await Q(sql`
    ALTER TABLE files ADD COLUMN member_id INTEGER REFERENCES members(id)
  `);
  const sites = await T.sites.all();
  const files = await T.files.all();
  for (let f of files) {
    const site = sites.find((s) => s.id === f.site_id);
    f.member_id = site!.member_id;
    await Q(sql`UPDATE files SET member_id = ${f.member_id} WHERE id = ${f.id}`);
  }
  // T.files.where({member_id: 0})
}

export async function down() {
  await Q(sql` ALTER TABLE files DROP COLUMN IF EXISTS member_id; `);
}
