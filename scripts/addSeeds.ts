import pool, { query } from '@db/pool';
import seed from '@db/seeds';

query(seed);
pool.end();
