import { Router } from 'express';
import { authorize, jsonParser } from '@server/lib/middlewares';
import { T } from '@db';

const router = Router();

router.post('/files', jsonParser, authorize, async (req, res) => {
  // const { id: memberId } = req.tokenMember!;
  // const { name, data } = req.body;
  // const site = await T.sites.where({ member_id: memberId }).one()
  // const file = await T.files.insert({ name, data, site_id: site.id });
  // return res.status(201).json(file);
});

export type RoutePostFilesIdQuery = {
  id: string;
  data: string;
  name: string;
};
export type RoutePostFilesId = Record<PropertyKey, never>;
router.post('/files/:id', jsonParser, authorize, async (req, res) => {
  const file = await T.files.get(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  const { id } = req.tokenMember!;
  const site = await T.sites.get(file.site_id);
  const member = await T.members.get(site.member_id);
  if (id !== member.id) return res.status(401).json({ error: 'Unauthorized' });
  const { data, name } = req.body;
  const bufferData = Buffer.from(data, 'base64');
  await T.files.update(file.id, { data: bufferData, data_size: bufferData.length, name });
  return res.status(200).json({});
});

export default router;
