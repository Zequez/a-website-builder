import { Q, sql } from '@db';

export async function up() {
  await Q(sql`
    BEGIN;
    -- Step 1: Add a new UUID column
    ALTER TABLE sites ADD COLUMN uuid UUID NOT NULL DEFAULT uuid_generate_v4();

    -- Step 2: Add site_uuid to files table and set the corresponding uuid from the sites table
    ALTER TABLE files ADD COLUMN site_uuid UUID;
    UPDATE files f SET site_uuid = s.uuid FROM sites s WHERE f.site_id = s.id;
    ALTER TABLE files ALTER COLUMN site_uuid SET NOT NULL;

    -- Step 3: Remove constraints
    ALTER TABLE files DROP CONSTRAINT files_site_id_fkey;
    ALTER TABLE sites DROP CONSTRAINT sites_pkey;

    -- Step 4: Drop and rename ID and UUID columns
    ALTER TABLE sites DROP COLUMN id;
    ALTER TABLE sites RENAME COLUMN uuid TO id;
    ALTER TABLE files DROP COLUMN site_id;
    ALTER TABLE files RENAME COLUMN site_uuid TO site_id;

    -- Step 5: Add constraints again
    ALTER TABLE sites ADD PRIMARY KEY (id);
    ALTER TABLE files ADD CONSTRAINT files_site_id_fkey FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE;

    COMMIT;
  `);
}

export async function down() {
  await Q(sql``);
}
