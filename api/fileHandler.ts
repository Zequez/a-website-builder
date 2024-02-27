import type { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getMime } from '../lib/utils';
import { T } from '../db/driver';

if (!process.env.BASE_HOSTNAME) throw 'BASE_HOSTNAME environment variable not set';

export default async (request: VercelRequest, response: VercelResponse) => {
  if (!process.env.BASE_HOSTNAME) throw 'BASE_HOSTNAME environment variable not set';
  if (!request.headers.host) throw 'No host?';
  if (!request.url) throw 'No URL?';

  const url = new URL(`${request.url}`, `https://${request.headers.host}`);

  const subdomain = url.hostname.replace(new RegExp(`.${process.env.BASE_HOSTNAME}$`), '');

  function parseUrlFile(url: URL) {
    let fileName = url.pathname.slice(1);
    if (!fileName) fileName = 'index.html';
    if (fileName.endsWith('/')) fileName += 'index.html';
    if (!fileName.match(/\./)) fileName += '.html';

    const ext = path.extname(fileName);
    const mimeType = getMime(ext);
    return { fileName, mimeType };
  }

  if (subdomain === url.hostname) {
    const { fileName, mimeType } = parseUrlFile(url);
    const filePath = `./app_dist/${fileName}`;

    if (!fs.existsSync(filePath)) {
      return notFound(response, 'File not found');
    } else {
      const file = fs.readFileSync(filePath);
      response.status(200);
      response.setHeader('Content-Type', mimeType);
      response.write(file);
      response.end();
    }
  } else {
    // Search site
    const site = await T.sites.where({ local_name: subdomain }).one();
    if (!site) return notFound(response, 'Site not found');

    // Search member
    const member = await T.members.where({ id: site.member_id }).one();

    const { fileName, mimeType } = parseUrlFile(url);

    const file = await T.files.where({ site_id: site.id, name: fileName }).one();

    if (!file) return notFound(response, 'File not found');

    response.status(200);
    response.setHeader('Content-Type', mimeType);
    response.write(mimeType.match(/text/) ? file.data.toString('utf8') : file.data);
    response.end();
  }
};

function notFound(response: VercelResponse, message: string) {
  response.status(404).json({ error: message });
}
