import { Router } from 'express';
import { authorize, jsonParser, errorHandler } from '@server/lib/middlewares';
import { T } from '@db';
import { FileB64 } from '@server/db/driver';
import { updateFileToB64 } from '@server/lib/utils';
import { uuid, validateUuid } from '@shared/utils';

const router = Router();

export type RouteGetFilesQuery = {
  member_id?: number;
};
export type RouteGetFiles = FileB64[];
router.get('/files', async (req, res) => {
  if (typeof req.query.member_id === 'string') {
    const files = await T.files.findByMemberId(req.query.member_id);
    return res.status(200).json(files.map(updateFileToB64));
  } else {
    return res.status(400).json({ error: 'Must use a query argument' });
  }
});

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
  id: string;
  site_id: string;
  name: string;
  data: string;
};
export type RoutePostFiles = FileB64;
router.post('/files', jsonParser, authorize, async (req, res) => {
  const { site_id, name, data, id } = req.body;

  const errors: string[] = [];
  if (!site_id) errors.push('Site ID is required');
  const site = await T.sites.get(site_id);
  if (!site) errors.push('Site does not exist');
  if (!name) errors.push('Name is required');
  if (id && !validateUuid(id)) errors.push('ID is invalid UUID');
  if (errors.length) {
    return res.status(400).json({ error: errors });
  }

  if (site!.member_id !== req.tokenMember!.id)
    return res.status(401).json({ error: 'Unauthorized' });

  const existingFile = await T.files.findExisting(site_id, name);
  if (existingFile) {
    return res.status(409).json({ error: 'File already exists' });
  }
  const idExistingFile = id ? await T.files.get(id) : null;
  if (idExistingFile) {
    return res.status(409).json({ error: 'File already exists' });
  }

  const bufferData = Buffer.from(data || '', 'base64');

  try {
    const file = await T.files.insert({
      name,
      data: bufferData,
      data_size: bufferData.length,
      site_id,
      ...(id ? { id } : {}),
    });
    return res.status(201).json(updateFileToB64(file));
  } catch (e) {
    console.error(e);
    return res.status(409).json({ error: 'Unknown error inserting file' });
  }
});

export type RouteDeleteFilesIdQuery = { id: string };
export type RouteDeleteFilesId = Record<PropertyKey, never>;
router.delete('/files/:id', authorize, async (req, res) => {
  if (!validateUuid(req.params.id)) return res.status(400).json({ error: 'Invalid UUID' });
  const file = await T.files.get(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  const site = await T.sites.get(file!.site_id);
  if (site!.member_id !== req.tokenMember!.id)
    return res.status(401).json({ error: 'Unauthorized' });

  await T.files.delete(req.params.id);
  return res.status(200).json({});
});

export type RoutePostFilesSaveBuildQuery = {
  siteId: string;
  files: { name: string; data: string }[];
};
export type RoutePostFilesSaveBuild = Record<PropertyKey, never>;
router.post('/files/saveBuild', authorize, jsonParser, async (req, res) => {
  const { siteId, files } = req.body;
  if (!siteId) return res.status(400).json({ error: 'Site ID is required' });
  if (!validateUuid(siteId)) return res.status(400).json({ error: 'Invalid UUID' });
  if (!files) return res.status(400).json({ error: 'Files are required' });

  const site = await T.sites.get(siteId);
  if (!site) return res.status(404).json({ error: 'Site not found' });

  if (site.member_id !== req.tokenMember!.id)
    return res.status(401).json({ error: 'Unauthorized' });

  await T.files.where({ site_id: site.id, is_dist: true }).delete();
  for (let file of files) {
    const bufferData = Buffer.from(file.data, 'base64');
    await T.files.insert({
      site_id: site.id,
      is_dist: true,
      name: file.name,
      data: bufferData,
      data_size: bufferData.length,
    });
  }

  return res.status(200).json({});
});

export default router;
