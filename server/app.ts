import './config';
import { isDev, API_PATH, APP_STATIC_PATH } from './config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import { T } from '@db';
import api from './routes/api';
import { logger, errorHandler } from './lib/middlewares.js';
import { parseUrlFile } from './lib/utils.js';
import hostnameParsingMiddleware from './lib/hostnameParsingMiddleware';
import { allLocales, defaultLocale } from './root-hostnames';

const app = express();

if (isDev) {
  app.use(cors());
}

app.use(logger(API_PATH));
app.use(`/${API_PATH}`, api);
app.use(hostnameParsingMiddleware);

const appDist = express.static(APP_STATIC_PATH);

// Read APP_STATIC_PATH / templates directories
const templatesDir = fs.readdirSync(path.join(APP_STATIC_PATH, 'templates'));
const availableTemplates = templatesDir.filter((name) => name !== 'assets');
const templateIndexes: { [key: string]: string } = {};
for (let templateKey of availableTemplates) {
  templateIndexes[templateKey] = fs.readFileSync(
    path.join(APP_STATIC_PATH, 'templates', templateKey, 'index.html'),
    'utf8',
  );
}

console.log(templateIndexes);

app.all('*', async (req, res, next) => {
  const url = req.resolvedUrl;

  if (!req.subDomain) {
    // On Vercel it serves the app directly without going through here
    if (req.locale !== defaultLocale && !req.url.startsWith('/assets')) {
      req.url = `/${req.locale}${req.url}`;
    }
    return appDist(req, res, next);
  } else {
    console.log('Site new URL ', url.toString());
    const tsite = await T.tsites.where({ subdomain: req.subDomain }).one();
    if (tsite) {
      const { fileName, mimeType } = parseUrlFile(url);
      if (fileName.match(/\/assets\/.*/)) {
        return appDist(req, res, next);
      }
      if (availableTemplates.indexOf(tsite.template) !== -1) {
        console.log(fileName);
        res.status(200);
        res.setHeader('Content-Type', 'text/html');
        res.write(templateIndexes[tsite.template]);
        res.end();
      } else {
        res.status(500).json({ error: 'Invalid site configuration, template unavailable' });
      }
    } else {
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
  }
});

app.all('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export default app;
