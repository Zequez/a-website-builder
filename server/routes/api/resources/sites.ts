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

export default router;
