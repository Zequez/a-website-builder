import { Q, sql } from '@db';

export async function up() {
  await Q(sql`
    CREATE TABLE blobs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(200) NOT NULL,
      memberId INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      url VARCHAR(200) NOT NULL,
      contentType VARCHAR(100) NOT NULL,
      size INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function down() {
  await Q(sql``);
}
