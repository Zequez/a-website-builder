import * as fs from 'fs';
import { exec } from 'child_process';
import { interfaceToType } from './utils';

export function generate() {
  exec(`pnpm pg-to-ts generate -c ${process.env.DEV_DATABASE_URL} -o ./server/db/schema.ts`, () => {
    const schema = fs.readFileSync('./server/db/schema.ts', 'utf8');
    fs.writeFileSync('./server/db/schema.ts', interfaceToType(schema, true));
    console.log('DB Schema types generated');
  });
}
