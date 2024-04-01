import type { TokenMember } from '@server/lib/utils';
import type { PoolClient } from 'pg';

declare global {
  namespace Express {
    interface Request {
      tokenMember?: TokenMember;
      resolvedUrl: URL;
      subDomain: string | null;
      rootDomain: string;
    }
  }

  namespace NodeJS {
    interface Global {
      GLOBAL_PG_CLIENT: PoolClient | undefined;
    }
  }
}
