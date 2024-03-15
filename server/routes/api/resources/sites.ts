import { Router } from 'express';
import { jsonParser, authorize } from '@server/lib/middlewares';
import { T, Site } from '@db';

const router = Router();

export type RouteGetSitesQuery = Record<PropertyKey, never>;
export type RouteGetSites = Site[];
router.get('/sites', async (req, res) => {
  const sites = await T.sites.all();
  return res.status(200).json(sites);
});

export type RoutePostSitesQuery = { name: string; localName: string };
export type RoutePostSites = Site;
router.post('/sites', jsonParser, authorize, async (req, res) => {
  const { id: memberId } = req.tokenMember!;
  const { name, localName } = req.body;
  const site = await T.sites.insert({ name, local_name: localName, member_id: memberId });
  return res.status(201).json(site);
});

export type RoutePutSitesIdQuery = { id: string; name: string; localName: string };
export type RoutePutSitesId = Record<PropertyKey, never>;
router.put(`/sites/:id`, jsonParser, authorize, async (req, res) => {
  const site = await T.sites.get(req.params.id);
  if (!site) return res.status(404).json({ error: 'Site not found' });
  if (site.member_id !== req.tokenMember!.id) return res.status(403).json({ error: 'Forbidden' });
  const { name, localName } = req.body;
  if (!name || !localName)
    return res.status(400).json({ error: 'Name and Local Name are required' });
  await T.sites.update(site.id, { name, local_name: localName });
  return res.status(200).json({});
});

export default router;
