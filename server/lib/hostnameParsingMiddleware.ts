import { Request, Response, NextFunction } from 'express';
import { rootHostnames, locales, defaultLocale } from '../root-hostnames';

const vercelMiddlewareMemberSite = '/_member_site_/';

// Hostname and subdomains middleware
const hostnameParsingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const forwardedHostFromVercel = req.headers['x-forwarded-host'];
  const headersHost = req.headers['host'];
  const resolvedHost = forwardedHostFromVercel || headersHost;
  if (!resolvedHost) throw 'No host?';
  if (!req.url) throw 'No URL?';
  const url = new URL(`${req.url}`, `https://${resolvedHost}`);

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

  if (subdomain && url.pathname.startsWith(vercelMiddlewareMemberSite)) {
    url.pathname = url.pathname.replace(vercelMiddlewareMemberSite, '/');
  }

  req.locale = locales[validHostname] || defaultLocale;
  req.rootDomain = validHostname;
  req.subDomain = subdomain;
  req.resolvedUrl = url;

  next();
};

export default hostnameParsingMiddleware;
