import fs from 'fs';
import path from 'path';

import { sql, Q } from '@db';
import * as migrations from './migrations';

const MIGRATIONS_DIR = './server/db/migrations';

async function addMigrationTable() {
  return Q(sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
async function migrationRecords() {
  return (await Q(sql`SELECT * FROM migrations ORDER BY name ASC`)) as { name: string }[];
}

export async function migrate(direction: number = 0) {
  await addMigrationTable();
  if (direction < 0) return await rollback(-direction);
  const migrationsRows = await migrationRecords();
  const migrationsNames = Object.keys(migrations).sort();
  let migrationsRunCounter = 0;
  for (let migrationName of migrationsNames) {
    const skipTheRest = direction !== 0 && migrationsRunCounter >= direction;
    if (skipTheRest) {
      console.log(`Not running ${migrationName}`);
    } else {
      const { up } = migrations[migrationName as keyof typeof migrations];
      if (migrationsRows.find((m) => m.name === migrationName)) {
        console.log(`Skipping ${migrationName}`);
      } else {
        console.log(`Running ${migrationName}`);
        migrationsRunCounter++;
        try {
          await up();
          await Q(sql`INSERT INTO migrations (name) VALUES (${migrationName})`);
        } catch (e) {
          console.error(`Migration ${migrationName} failed`);
          throw e;
        }
      }
    }
  }

  console.log('DONE');
}

export async function rollback(amount: number = 0) {
  const migrationsRows = await migrationRecords();
  const migrationsNames = Object.keys(migrations).sort();
  let counter = 0;
  for (let i = migrationsRows.length - 1; i >= 0; i--) {
    const migrationName = migrationsNames[i];
    const { down } = migrations[migrationName as keyof typeof migrations];
    console.log(`Rolling back ${migrationName}`);
    try {
      await down();
      await Q(sql`DELETE FROM migrations WHERE name = ${migrationName}`);
    } catch (e) {
      console.error(`Migration ${migrationName} failed`);
      throw e;
    }
    counter++;
    if (amount !== 0 && counter >= amount) break;
  }
}

function getMigrationsFilesNames() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name !== 'index.ts' && name !== 'template.ts')
    .map((name) => name.replace(/\.ts$/, ''));
}

export function createNewMigrationFile() {
  const migrationName = process.argv.slice(2)[0];
  const date = new Date();
  const timestamp = (date.getTime() / 1000) | 0;
  if (!migrationName) throw 'Must provide migration name';

  fs.copyFileSync(
    path.join(MIGRATIONS_DIR, 'template.ts'),
    path.join(MIGRATIONS_DIR, `m${timestamp}_${migrationName}.ts`),
  );

  const indexExport = getMigrationsFilesNames()
    .map((name) => `export * as ${name} from './${name}';`)
    .join('\n');
  fs.writeFileSync(path.join(MIGRATIONS_DIR, `index.ts`), indexExport);
}
