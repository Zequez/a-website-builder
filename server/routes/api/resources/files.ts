import { Router } from 'express';
import { authorize, jsonParser } from '@server/lib/middlewares';
import { T } from '@db';
import { FileB64 } from '@server/db/driver';
import { updateFileToB64 } from '@server/lib/utils';
import { uuid } from '@shared/utils';

const router = Router();

export type RoutePutFilesIdQuery = {
  id: string;
  data: string;
  name: string;
};
export type RoutePutFilesId = Record<PropertyKey, never>;
router.put('/files/:id', jsonParser, authorize, async (req, res) => {
  const file = await T.files.get(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  const { data, name } = req.body;

  const errors = [];
  const site = await T.sites.get(file.site_id);
  if (!name) errors.push('Name is required');
  if (errors.length) {
    return res.status(400).json({ error: errors });
  }

  if (site!.member_id !== req.tokenMember!.id)
    return res.status(401).json({ error: 'Unauthorized' });

  const existingFile = await T.files.findExisting(site!.id, name);
  if (existingFile && existingFile.id !== file.id) {
    return res.status(409).json({ error: 'File already exists' });
  }

  const bufferData = Buffer.from(data, 'base64');
  await T.files.update(file.id, { data: bufferData, data_size: bufferData.length, name });
  return res.status(200).json({});
});

export type RoutePostFilesQuery = {
  site_id: string;
  name: string;
  data: string;
};
export type RoutePostFiles = FileB64;
router.post('/files', jsonParser, authorize, async (req, res) => {
  const { site_id, name, data } = req.body;

  const errors: string[] = [];
  if (!site_id) errors.push('Site ID is required');
  const site = await T.sites.get(site_id);
  if (!site) errors.push('Site does not exist');
  if (!name) errors.push('Name is required');
  if (errors.length) {
    return res.status(400).json({ error: errors });
  }

  if (site!.member_id !== req.tokenMember!.id)
    return res.status(401).json({ error: 'Unauthorized' });

  const existingFile = await T.files.findExisting(site_id, name);
  if (existingFile) {
    return res.status(409).json({ error: 'File already exists' });
  }

  const bufferData = Buffer.from(data || '', 'base64');

  const file = await T.files.insert({
    name,
    data: bufferData,
    data_size: bufferData.length,
    site_id,
  });
  return res.status(201).json(updateFileToB64(file));
});

export type RouteDeleteFilesQuery = Record<PropertyKey, never>;
export type RouteDeleteFiles = Record<PropertyKey, never>;
router.delete('/files/:id', authorize, async (req, res) => {
  const file = await T.files.get(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  const site = await T.sites.get(file!.site_id);
  if (site!.member_id !== req.tokenMember!.id)
    return res.status(401).json({ error: 'Unauthorized' });

  await T.files.delete(req.params.id);
  return res.status(204).json({});
});

export default router;
