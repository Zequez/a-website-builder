import { Request, Response, NextFunction } from 'express';
import { getSubdomain, verifiedTokenFromHeader } from './utils.js';
import bodyParser from 'body-parser';

export const logger = (apiPath: string) => (req: Request, res: Response, next: NextFunction) => {
  const { method } = req;
  const url = new URL(`${req.url}`, `https://${req.headers.host}`);
  const subdomain = getSubdomain(url);
  const isAPI = req.url.startsWith(`/${apiPath}`);
  console.log(
    `${method} ${subdomain ? `[${subdomain}.]` : '[APP]'} ${
      isAPI ? req.url.replace(`/${apiPath}`, '[API] ') : req.url
    }`,
  );
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
