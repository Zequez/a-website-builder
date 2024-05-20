import { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { isDev, isTest } from '@server/config.js';
import { prodRootHostnames, devRootHostnames } from '@server/domains';

const rootHostnames = isDev || isTest ? devRootHostnames : prodRootHostnames;

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const { method } = req;
  const url = new URL(`${req.url}`, `https://${req.headers.host}`);

  console.log(`${method} ${url.toString()}`);
  next();
};

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

export const hostnameParsingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // const forwardedHostFromVercel = req.headers['x-forwarded-host'];
  const headersHost = req.headers['host']!;
  // const resolvedHost = forwardedHostFromVercel || headersHost;
  if (!req.url) throw 'No URL?';
  const url = new URL(`${req.url}`, `https://${headersHost}`);

  let validHostname: null | string = null;
  let subdomain: null | string = null;
  for (let hostname of rootHostnames) {
    if (hostname === url.hostname) {
      validHostname = hostname;
      break;
    } else if (url.hostname.endsWith(hostname)) {
      subdomain = url.hostname.replace(new RegExp(`\\.${hostname}$`), '');
      validHostname = hostname;
      break;
    }
  }

  if (!validHostname) {
    return res.status(400).json({
      error: `Invalid hostname. Valid hostnames are: ${rootHostnames.join(' or ')}`,
    });
  }

  // if (subdomain && url.pathname.startsWith(vercelMiddlewareMemberSite)) {
  //   url.pathname = url.pathname.replace(vercelMiddlewareMemberSite, '/');
  // }

  req.rootDomain = validHostname;
  req.subDomain = subdomain;
  req.resolvedUrl = url;

  next();
};

export const jsonParser = bodyParser.json({ limit: '500kb' });
