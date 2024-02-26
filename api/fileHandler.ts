import type { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';
import { T } from '../db/driver';

if (!process.env.BASE_HOSTNAME) throw 'BASE_HOSTNAME environment variable not set';

export default async (request: VercelRequest, response: VercelResponse) => {
  if (!process.env.BASE_HOSTNAME) throw 'BASE_HOSTNAME environment variable not set';
  if (!request.headers.host) throw 'No host?';
  if (!request.url) throw 'No URL?';

  const url = new URL(`${request.url}`, `https://${request.headers.host}`);

  const subdomain = url.hostname.replace(new RegExp(`.${process.env.BASE_HOSTNAME}$`), '');

  if (subdomain === url.hostname) {
    return response.status(200).json({ title: `SHOW APP HERE` });
  } else {
    // Search site
    const site = await T.sites.where({ local_name: subdomain }).one();
    if (!site) return notFound(response, 'Site not found');

    // Search member
    const member = await T.members.where({ id: site.member_id }).one();

    // Search file
    let fileName = url.pathname.slice(1);
    if (!fileName) fileName = 'index.html';
    if (fileName.endsWith('/')) fileName += 'index.html';
    if (!fileName.match(/\./)) fileName += '.html';

    const file = await T.files.where({ site_id: site.id, name: fileName }).one();

    if (!file) return notFound(response, 'File not found');

    response.status(200);
    response.setHeader('Content-Type', 'text/html');
    response.write(file.data.toString('utf8'));
    response.end();
  }
};

function notFound(response: VercelResponse, message: string) {
  response.status(404).json({ error: message });
}
