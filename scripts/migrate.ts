import pool from '@db/pool';
import { migrate } from '@db/migration';

const direction = parseInt(process.argv.slice(2)[0]) || 0;
await migrate(direction);
pool.end();
