import { Q, sql } from '@db';

export async function up() {
  await Q(sql`
    BEGIN;
    -- Step 1: Add the updated_at column if it doesn't exist
    ALTER TABLE sites ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE files ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    -- Step 2: Create a trigger function to update the updated_at column
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Step 3: Create a trigger that fires the trigger function on UPDATE
    CREATE TRIGGER trigger_update_updated_at_sites
    BEFORE UPDATE ON sites
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();

    CREATE TRIGGER trigger_update_updated_at_files
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();

    COMMIT;
  `);
}

export async function down() {
  await Q(sql``);
}
