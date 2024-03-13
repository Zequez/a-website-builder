import { Router } from 'express';
import { tokenData, tokenFromHeader, sanitizeMember } from '@server/lib/utils';
import { jsonParser } from '@server/lib/middlewares';
import { T, Member, SiteWithFiles } from '@db';

const router = Router();

export type RouteResourceMembers = Omit<Member, 'passphrase'>[];
router.get('/members', async (req, res) => {
  const members = await T.members.all();
  return res.status(200).json(members.map(sanitizeMember));
});

export type RouteResourceMembersId = Omit<Member, 'passphrase'> & { sites: SiteWithFiles[] };
router.get('/members/:id', async (req, res) => {
  const member = await T.members.withSitesAndFiles(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  return res.status(200).json({
    ...sanitizeMember(member),
  } as RouteResourceMembersId);
});

export default router;
