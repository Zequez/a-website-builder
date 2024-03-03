import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { T } from './db/driver.js';
import api from './api';
import logger from './logger';
import { parseUrlFile, getSubdomain } from './utils.js';

const API_PATH = '_api_';

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(cors());
}

app.use(logger(API_PATH));
app.use(`/${API_PATH}`, api);

const appDist = express.static('app_dist');

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

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server ready on port ${port}.`));

export default app;
