import './config';
import { isDev, API_PATH, APP_STATIC_PATH } from './config';
import express from 'express';
import cors from 'cors';

import { T } from '@db';
import api from './api';
import { logger, errorHandler } from './lib/middlewares.js';
import { parseUrlFile } from './lib/utils.js';
import hostnameParsingMiddleware from './lib/hostnameParsingMiddleware';
import { allLocales, defaultLocale } from './root-hostnames';
import templatesIndexes from './templates';

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
    if (req.locale !== defaultLocale && !req.url.startsWith('/assets')) {
      req.url = `/${req.locale}${req.url}`;
    }
    return appDist(req, res, next);
  } else {
    // On Vercel it serves the app directly without going through here
    const { fileName, mimeType } = parseUrlFile(url);
    if (fileName.match(/templates\/assets\/.*/)) {
      return appDist(req, res, next);
    }

    // TODO: Consider top-level-domains too
    const tsite = await T.tsites.where({ subdomain: req.subDomain }).one();
    if (tsite) {
      let page = await T.prerendered.where({ path: url.pathname, tsite_id: tsite.id }).one();
      if (!page) {
        // Not found page
        page = await T.prerendered.where({ path: '', tsite_id: tsite.id }).one();
      }

      if (!page) {
        return next();
      }
      const m = templatesIndexes.genesis.match(/<!--{{TEMPLATE_ASSETS}}-->([^]*)<\/head>/);
      if (!m || !m[1]) throw 'Could not find template assets';
      const contentWithLatestAssetsLinks = page.content.replace(
        /<!--{{TEMPLATE_ASSETS}}-->([^]*)<\/head>/,
        `<!--Latest assets-->${m[1]}</head>`,
      );

      res.status(page.path === '' ? 404 : 200);
      res.setHeader('Content-Type', 'text/html');
      res.write(contentWithLatestAssetsLinks);
      res.end();
    }
    // I might deprecate this soon
    else {
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
