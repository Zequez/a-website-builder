import { Q, sql } from '@db';

export async function up() {
  // Update members table so that
  // change full_name to allow null values
  // add subscribed_to_newsletter
  await Q(sql`
    ALTER TABLE members
    ALTER COLUMN full_name DROP NOT NULL,
    ADD COLUMN subscribed_to_newsletter BOOLEAN DEFAULT FALSE;
  `);
}

export async function down() {
  await Q(sql``);
}
