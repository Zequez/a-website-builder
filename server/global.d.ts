import type { TokenMember } from '@server/lib/utils';

declare global {
  namespace Express {
    interface Request {
      tokenMember?: TokenMember;
    }
  }
}
