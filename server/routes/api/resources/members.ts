import { Router } from 'express';
import {
  tokenData,
  tokenFromHeader,
  sanitizeMember,
  hashPass,
  hashCompare,
} from '@server/lib/utils';
import { authorize, jsonParser } from '@server/lib/middlewares';
import { T, Member, SiteWithFiles, sql } from '@db';
import { wait } from '@shared/utils';

const router = Router();

export type RouteGetMembersQuery = Record<PropertyKey, never>;
export type RouteGetMembers = Omit<Member, 'passphrase'>[];
router.get('/members', async (req, res) => {
  const members = await T.members.all();
  return res.status(200).json(members.map(sanitizeMember));
});

export type RouteGetMembersAvailabilityQuery = {
  id?: number;
  email?: string;
  tag?: string;
  telegram_handle?: string;
};
export type RouteGetMembersAvailability = {
  email?: boolean;
  tag?: boolean;
  telegram_handle?: boolean;
};
router.get('/members/availability', async (req, res) => {
  await wait(3000);
  const input = req.query as RouteGetMembersAvailabilityQuery;
  const output: RouteGetMembersAvailability = {};
  if (input.email) {
    output.email = await T.members.isUnique(input.id || null, 'email', input.email);
  }
  if (input.telegram_handle) {
    output.telegram_handle = await T.members.isUnique(
      input.id || null,
      'telegram_handle',
      input.telegram_handle,
    );
  }
  if (input.tag) {
    output.tag = await T.members.isUnique(input.id || null, 'tag', input.tag);
  }
  return res.status(200).json(output);
});

export type RouteGetMembersIdQuery = { id: number };
export type RouteGetMembersId = Omit<Member, 'passphrase'>;
router.get('/members/:id', async (req, res) => {
  const member = await T.members.get(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  return res.status(200).json({
    ...sanitizeMember(member),
  } as RouteGetMembersId);
});

export type RoutePatchMembersIdQuery = {
  id: number;
  full_name?: string;
  tag?: string;
  telegram_handle?: string;
  password?: string;
  currentPassword?: string;
  subscribed_to_newsletter?: boolean;
};
export type RoutePatchMembersId = Omit<Member, 'passphrase'>;
router.patch('/members/:id', jsonParser, authorize, async (req, res) => {
  await wait(2000);

  const member = await T.members.get(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  if (member.id !== req.tokenMember!.id) return res.status(403).json({ error: 'Forbidden' });
  const body = req.body as RoutePatchMembersIdQuery;

  // Build update query
  const update: any = {};
  if (body.full_name) {
    const full_name = body.full_name;
    if (full_name.length > 100) return res.status(400).json({ error: 'Full name too long' });
    update.full_name = full_name;
  }
  if (body.tag) {
    const tag = body.tag;
    if (member.tag) return res.status(400).json({ error: 'Tag cannot be updated once set' });
    if (await T.members.where({ tag }).one())
      return res.status(400).json({ error: 'Tag already in use' });
    if (tag.length < 3 || tag.length > 32)
      return res.status(400).json({ error: 'Tag must be between 3 and 32 characters' });
    if (tag[0].match(/[^a-z]/i))
      return res.status(400).json({ error: 'Tag must start with a letter' });
    if (tag.match(/_$/)) return res.status(400).json({ error: 'Tag cannot end in an underscore' });
    if (tag.match(/__/))
      return res.status(400).json({ error: 'Tag cannot contain 2 underscores in a row' });
    update.tag = tag;
  }
  if (body.telegram_handle) {
    const telegram = body.telegram_handle;
    if (!(await T.members.isUnique(member.id, 'telegram_handle', telegram)))
      return res.status(400).json({ error: 'Telegram handle already claimed by another member' });
    if (telegram.length < 5 || telegram.length > 32)
      return res.status(400).json({ error: 'Telegram handle must be between 5 and 32 characters' });
    if (telegram.match(/[^a-z0-9_]/i)) {
      return res
        .status(400)
        .json({ error: 'Telegram handle must only contain letters, numbers, and underscores' });
    }
    update.telegram_handle = telegram;
  }

  if (body.password) {
    const pass = body.password;
    const currentPass = body.currentPassword;
    if (pass.length < 6)
      return res.status(400).json({ error: 'Password has to be at least 6 characters' });
    if (!currentPass) return res.status(400).json({ error: 'Current password is required' });
    if (!(await hashCompare(currentPass, member.passphrase)))
      return res.status(400).json({ error: 'Wrong current password' });
    update.passphrase = await hashPass(pass);
  }

  if (typeof body.subscribed_to_newsletter !== 'undefined') {
    update.subscribed_to_newsletter = !!body.subscribed_to_newsletter;
  }

  if (Object.keys(update).length === 0) return res.status(400).json({ error: 'Nothing to update' });
  await T.members.update(member.id, update);

  return res.status(200).json(sanitizeMember({ ...member, ...update }));
});

export default router;
