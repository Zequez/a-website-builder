import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Member } from '../db/driver';

export default async (request: VercelRequest, response: VercelResponse) => {
  const members = await Member.all();
  return response.status(200).json({ data: members });
};
