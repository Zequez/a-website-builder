import { Q, sql } from '@db';

export async function up() {
  await Q(sql`
    BEGIN transaction;

    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) NOT NULL UNIQUE,
      full_name VARCHAR(100) NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      active BOOLEAN DEFAULT TRUE,
      passphrase VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sites (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      local_name VARCHAR(100) NOT NULL UNIQUE,
      domain_name VARCHAR(100) UNIQUE,
      member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS files (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      site_id INT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      data BYTEA,
      data_size BIGINT,
      data_cdn_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    COMMIT;
  `);
}

export async function down() {}
