import './config';
import { isDev, API_PATH, APP_STATIC_PATH } from './config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import { T } from '@db';
import api from './routes/api';
import { logger, errorHandler } from './lib/middlewares.js';
import { parseUrlFile } from './lib/utils.js';
import hostnameParsingMiddleware from './lib/hostnameParsingMiddleware';

const app = express();

if (isDev) {
  app.use(cors());
}

app.use(logger(API_PATH));
app.use(`/${API_PATH}`, api);
app.use(hostnameParsingMiddleware);

const appDist = express.static(APP_STATIC_PATH);

app.all('*', async (req, res, next) => {
  const url = req.resolvedUrl;

  if (!req.subDomain) {
    // On Vercel it serves the app directly without going through here
    return appDist(req, res, next);
  } else {
    console.log('Site new URL ', url.toString());
    const site = await T.sites.where({ local_name: req.subDomain }).one();
    if (!site) return next();
    const { fileName, mimeType } = parseUrlFile(url);
    const file = await T.files.where({ site_id: site.id, name: fileName, is_dist: true }).one();
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

app.use(errorHandler);

export default app;
