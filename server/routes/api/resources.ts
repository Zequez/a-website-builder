import express from 'express';
import bodyParser from 'body-parser';
import { T, query, Member, Site, File_ } from '@db';
import { sanitizeMember } from '@server/lib/utils';

const jsonParser = bodyParser.json();

const router = express.Router();

router.get('/members', async (req, res) => {
  const members = await T.members.all();
  return res.status(200).json(members.map(sanitizeMember));
});

router.get('/members/:id', async (req, res) => {
  const member = await T.members.withSitesAndFiles(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  return res.status(200).json({
    ...sanitizeMember(member),
  });
});

router.post('/files/:id', jsonParser, async (req, res) => {
  const file = await T.files.get(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  const { data, name } = req.body;
  const bufferData = Buffer.from(data, 'base64');
  await T.files.update(file.id, { data: bufferData, data_size: bufferData.length, name });
  return res.status(200).json({});
});

router.get('/sites', async (req, res) => {
  const sites = await T.sites.all();
  return res.status(200).json(sites);
});

export default router;
