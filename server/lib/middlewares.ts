import { Request, Response, NextFunction } from 'express';
import { verifiedTokenFromHeader } from './utils.js';
import bodyParser from 'body-parser';
import { isDev, isTest } from '@server/config.js';

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
  } else if (new Date(maybeTokenMember.exp * 1000).getTime() < new Date().getTime()) {
    return res.status(401).json({ error: 'Token expired' });
  }

  req.tokenMember = maybeTokenMember;
  next();
}

export async function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const errMsg = err.message || `Something went wrong with the server.`;
  return res.status(statusCode).json({
    error: errMsg,
    status: statusCode,
    stack: isDev || isTest ? err.stack : {},
  });
}

export const jsonParser = bodyParser.json();
