import express from 'express';
import bodyParser from 'body-parser';
import { T, Member } from '@db';
import { sanitizeMember } from '@server/lib/utils';

const jsonParser = bodyParser.json();

const router = express.Router();

router.get('/members', async (req, res) => {
  const members = await T.members.all();
  return res.status(200).json({ members: members.map(sanitizeMember) });
});

export default router;
