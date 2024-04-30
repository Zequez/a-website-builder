import { QQ } from '@db';

export async function up() {
  await QQ`
    CREATE TABLE IF NOT EXISTS tsites (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      config JSONB NOT NULL,
      template VARCHAR(100) NOT NULL,
      name VARCHAR(100) NOT NULL,
      subdomain VARCHAR(100) NOT NULL UNIQUE,
      domain VARCHAR(100) NOT NULL UNIQUE,
      access_key VARCHAR(100) NOT NULL,
      rendered_pages JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function down() {
  await QQ`DROP TABLE IF EXISTS tsites`;
}
