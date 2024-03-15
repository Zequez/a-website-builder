import { Request, Response, NextFunction } from 'express';
import { verifiedTokenFromHeader } from './utils.js';
import bodyParser from 'body-parser';

export const logger = (apiPath: string) => (req: Request, res: Response, next: NextFunction) => {
  const { method } = req;
  const url = new URL(`${req.url}`, `https://${req.headers.host}`);

  // const isAPI = req.url.startsWith(`/${apiPath}`);
  console.log(`${method} ${url.toString()}}`);
  next();
};

export function authorize(req: Request, res: Response, next: NextFunction) {
  const maybeTokenMember = verifiedTokenFromHeader(req.headers);
  if (!maybeTokenMember) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.tokenMember = maybeTokenMember;
  next();
}

export const jsonParser = bodyParser.json();
