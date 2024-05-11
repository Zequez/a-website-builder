import './config';
import { isDev, API_PATH, APP_STATIC_PATH } from './config';
import express from 'express';
import cors from 'cors';

import { T } from '@db';

import { logger, errorHandler, hostnameParsingMiddleware } from './lib/middlewares';
import { parseUrlFile } from './lib/utils.js';
import templatesIndexes from './templates';
import pipe from './api/pipe';

const app = express();

if (isDev) {
  app.use(cors());
}

app.use(logger);
app.use(`/${API_PATH}`, pipe);
app.use(hostnameParsingMiddleware);

const appDist = express.static(APP_STATIC_PATH);

app.use(appDist);

app.all('*', async (req, res, next) => {
  if (req.rootDomain === 'hojaweb.xyz') {
    return res.redirect(301, 'https://hoja.ar');
  }

  const url = req.resolvedUrl;

  // On Vercel it serves the app directly without going through here
  const { fileName } = parseUrlFile(url);
  if (fileName.match(/templates\/assets\/.*/)) {
    return appDist(req, res, next);
  }

  const subdomain = req.subDomain || '';
  const domain = subdomain ? `.${req.rootDomain}` : req.rootDomain;

  // TODO: Consider top-level-domains too
  const tsite = await T.tsites.where({ subdomain, domain }).one();
  if (!tsite) return next();

  let page = await T.prerendered.where({ path: url.pathname, tsite_id: tsite.id }).one();
  // Not found page is prerendered with path=''
  if (!page) page = await T.prerendered.where({ path: '', tsite_id: tsite.id }).one();
  if (!page) return next();

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
});

app.all('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export default app;
