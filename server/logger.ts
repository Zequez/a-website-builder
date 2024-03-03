import { Request, Response, NextFunction } from 'express';
import { getSubdomain } from './utils.js';

const logger = (apiPath: string) => (req: Request, res: Response, next: NextFunction) => {
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

export default logger;
