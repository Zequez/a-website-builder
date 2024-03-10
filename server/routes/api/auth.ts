import { Router } from 'express';
import bodyParser from 'body-parser';
import { T } from '@db';
import {
  hashCompare,
  hashPass,
  validateEmail,
  tokenData,
  sanitizeMember,
  tokenFromMember,
} from '@server/lib/utils';

const jsonParser = bodyParser.json();

const router = Router();

type SignUpQuery = {
  email: string;
  passphrase: string;
  fullName: string;
};
router.post('/signUp', jsonParser, async (req, res) => {
  const { email, passphrase, fullName } = req.body as SignUpQuery;

  if (!email || !passphrase || !fullName) {
    return res.status(400).json({ error: 'Bad request' });
  }

  const members = await T.members.all();
  const member = members.find((m) => m.email === email);
  if (member) return res.status(409).json({ error: 'User already exists' });

  const errors: string[] = [];
  if (passphrase.length < 6) {
    errors.push('Passphrase must be at least 6 characters');
  }
  if (!validateEmail(email)) {
    errors.push('Invalid email');
  }
  if (errors.length) return res.status(400).json({ errors });

  const insertedMember = await T.members.insert({
    email,
    passphrase: await hashPass(passphrase),
    full_name: fullName,
  });

  res.status(201).json({
    member: sanitizeMember(insertedMember),
    token: await tokenFromMember(insertedMember),
  });
});

router.post('/signIn', jsonParser, async (req, res) => {
  const { email, passphrase } = req.body;

  const member = await T.members.where({ email }).one();

  if (
    !member ||
    (member.passphrase && !(await hashCompare(passphrase, member.passphrase))) ||
    (!member.passphrase && !!passphrase)
  )
    return res.status(401).json({ error: 'Unauthorized' });

  return res
    .status(200)
    .json({ member: sanitizeMember(member), token: await tokenFromMember(member) });
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { id: memberId, exp } = tokenData(token);
  if (new Date(exp * 1000).getTime() < new Date().getTime()) {
    return res.status(401).json({ error: 'Token expired' });
  }

  const member = await T.members.get(memberId);
  if (!member) return res.status(404).json({ error: 'Member deleted maybe' });

  return res.status(200).json({ member: sanitizeMember(member) });
});

router.post('/changePass', jsonParser, async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Need a token' });
  const { id: memberId } = tokenData(token);
  const member = await T.members.get(memberId);
  if (!member) return res.status(404).json({ error: 'Member deleted maybe' });

  const { oldPassphrase, newPassphrase } = req.body;

  if (newPassphrase.length < 6) {
    return res.status(400).json({ error: 'Passphrase must be at least 6 characters' });
  }

  if (!oldPassphrase && member.passphrase) {
    return res.status(400).json({ error: 'Old passphrase is required' });
  }

  console.log('PASS', member.passphrase);

  if (
    (member.passphrase && !(await hashCompare(oldPassphrase, member.passphrase))) ||
    (!member.passphrase && !!oldPassphrase)
  ) {
    return res.status(400).json({ error: 'Wrong password' });
  }

  await T.members.update(member.id, { passphrase: await hashPass(newPassphrase) });

  res.status(200).json({});
});

export default router;
