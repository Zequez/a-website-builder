import type { VercelRequest, VercelResponse } from '@vercel/node';
import { T } from '../db/driver';
import { rowsToJson } from '../lib/utils';

export default async (request: VercelRequest, response: VercelResponse) => {
  const members = await T.members.all();
  return response.status(200).json({ data: rowsToJson(members, ['passphrase']) });
};
