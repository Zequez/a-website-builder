import { QQ } from '@db';

export async function up() {
  await QQ`
    CREATE TABLE IF NOT EXISTS prerendered (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tsite_id UUID NOT NULL REFERENCES tsites(id) ON DELETE CASCADE,
      path VARCHAR(150) NOT NULL,
      content TEXT NOT NULL,
      assets_hash_key VARCHAR(30) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function down() {
  await QQ`DROP TABLE IF EXISTS prerendered`;
}
