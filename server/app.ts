import './config';
import { env, isDev, API_PATH, APP_STATIC_PATH } from './config';
import express from 'express';
import cors from 'cors';

import { T } from '@db';
import api from './routes/api';
import logger from './lib/logger.js';
import { parseUrlFile, getSubdomain } from './lib/utils.js';

const app = express();

if (isDev) {
  app.use(cors());
}

app.use(logger(API_PATH));
app.use(`/${API_PATH}`, api);

const appDist = express.static(APP_STATIC_PATH);

app.all('*', async (req, res, next) => {
  if (!req.headers.host) throw 'No host?';
  if (!req.url) throw 'No URL?';

  const url = new URL(`${req.url}`, `https://${req.headers.host}`);

  const subdomain = getSubdomain(url);

  if (!subdomain) {
    // Serve static app
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
