import { Router } from 'express';
import { jsonParser, authorize } from '@server/lib/middlewares';
import { T, Site } from '@db';
import { validateUuid } from '@shared/utils';

const router = Router();

export type RouteGetSitesQuery = Record<PropertyKey, never>;
export type RouteGetSites = Site[];
router.get('/sites', async (req, res) => {
  const sites = await T.sites.all();
  return res.status(200).json(sites);
});

export type RoutePostSitesQuery = { name: string; localName: string; id?: string };
export type RoutePostSites = Site;
router.post('/sites', jsonParser, authorize, async (req, res) => {
  const { id: memberId } = req.tokenMember!;
  const { name, localName, id } = req.body;
  if (id) {
    if (!validateUuid(id)) {
      return res.status(400).json({ error: 'Invalid UUID' });
    }
    const existingSite = await T.sites.get(id);
    if (existingSite) return res.status(409).json({ error: 'Site with UUID already exists' });
  }
  let insertVal: any = { name, local_name: localName, member_id: memberId };
  if (id) insertVal.id = id;
  const site = await T.sites.insert(insertVal);
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
