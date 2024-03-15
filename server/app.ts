import './config';
import { isDev, API_PATH, APP_STATIC_PATH, BASE_HOSTNAME, BASE_HOSTNAME2 } from './config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import { T } from '@db';
import api from './routes/api';
import { logger } from './lib/middlewares.js';
import { parseUrlFile } from './lib/utils.js';

const app = express();

if (isDev) {
  app.use(cors());
}

function logErrors(err: any, req: any, res: any, next: any) {
  console.error(err.stack);
  next(err);
}
app.use(logErrors);

app.use(logger(API_PATH));
app.use(`/${API_PATH}`, api);

const appDist = express.static(APP_STATIC_PATH);

const VALID_BASE_HOSTNAMES = [BASE_HOSTNAME, BASE_HOSTNAME2];

export function getSubdomain(url: URL) {
  const subdomain = url.hostname.replace(new RegExp(`\\.${BASE_HOSTNAME}$`), '');
  if (subdomain === url.hostname) return null;
  return subdomain;
}

app.all('*', async (req, res, next) => {
  if (!req.headers.host) throw 'No host?';
  if (!req.url) throw 'No URL?';

  const url = new URL(`${req.url}`, `https://${req.headers.host}`);

  let validHostname: null | string = null;
  let subdomain: null | string = null;
  for (let hostname of VALID_BASE_HOSTNAMES) {
    if (hostname === url.hostname) {
      validHostname = hostname;
    } else if (url.hostname.endsWith(hostname)) {
      subdomain = url.hostname.replace(new RegExp(`\\.${hostname}$`), '');
      validHostname = hostname;
    }
  }

  if (!validHostname)
    return res
      .status(400)
      .json({
        error: `Invalid hostname. Valid hostnames are: ${VALID_BASE_HOSTNAMES.join(' or ')}`,
      });

  if (!subdomain) {
    // Serve static app
    if (req.url === '/editor') {
      return res.sendFile(path.resolve(path.join(APP_STATIC_PATH, 'index.html')));
    }

    return appDist(req, res, next);
  } else {
    const site = await T.sites.where({ local_name: subdomain }).one();
    if (!site) return next();
    const { fileName, mimeType } = parseUrlFile(url);
    const file = await T.files.where({ site_id: site.id, name: fileName }).one();
    if (!file) return next();

    res.status(200);
    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.write(mimeType && mimeType.match(/text/) ? file.data.toString('utf8') : file.data);
    res.end();
  }
});

app.all('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
