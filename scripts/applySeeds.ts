import pool from '@db/pool';
import { apply } from '@db/seeds';

await apply();
pool.end();
