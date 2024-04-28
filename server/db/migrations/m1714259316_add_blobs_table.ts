import { Q, sql } from '@db';

export async function up() {
  await Q(sql`
    CREATE TABLE blobs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(200) NOT NULL,
      member_id INT NOT NULL REFERENCES members(id) ON DELETE NO ACTION,
      url VARCHAR(200) NOT NULL,
      content_type VARCHAR(100) NOT NULL,
      size INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function down() {
  await Q(sql`DROP TABLE IF EXISTS blobs`);
}
