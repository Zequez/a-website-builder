import { Router } from 'express';
import bodyParser from 'body-parser';
import { googleClient, googleOauthForMember } from '@server/lib/oauth';
import { GoogleTokens, Member, SanitizedMember, T } from '@db';
import {
  hashCompare,
  hashPass,
  tokenData,
  sanitizeMember,
  tokenFromMember,
} from '@server/lib/utils';
import { validateEmail } from '@shared/utils';
import { authorize } from '@server/lib/middlewares';

const jsonParser = bodyParser.json();

const router = Router();

export type RoutePostAuthSignUp = {
  member: SanitizedMember;
  token: string;
};
export type RoutePostAuthSignUpQuery = {
  email: string;
  password: string;
  subscribedToNewsletter: boolean;
};
router.post('/signUp', jsonParser, async (req, res) => {
  const { email, password, subscribedToNewsletter } = req.body as RoutePostAuthSignUpQuery;

  if (!email || !password) {
    return res.status(400).json({ error: 'Bad request' });
  }

  const members = await T.members.all();
  const member = members.find((m) => m.email === email);
  if (member) return res.status(409).json({ error: 'User already exists' });

  const errors: string[] = [];
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (!validateEmail(email)) {
    errors.push('Invalid email');
  }
  if (errors.length) return res.status(400).json({ error: errors });

  const insertedMember = await T.members.insert({
    email,
    passphrase: await hashPass(password),
    subscribed_to_newsletter: !!subscribedToNewsletter,
  });

  res.status(201).json({
    member: sanitizeMember(insertedMember),
    token: await tokenFromMember(insertedMember),
  });
});

export type RoutePostAuthSignInQuery = {
  email: string;
  passphrase: string;
};
export type RoutePostAuthSignIn = {
  member: SanitizedMember;
  token: string;
};
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

export type RouteGetAuthMeQuery = Record<PropertyKey, never>;
export type RouteGetAuthMe = {
  member: SanitizedMember;
};
router.get('/me', authorize, async (req, res) => {
  const member = await T.members.get(req.tokenMember!.id);
  if (!member) return res.status(404).json({ error: 'Member deleted maybe' });

  return res.status(200).json({ member: sanitizeMember(member) });
});

//  ██████╗  ██████╗  ██████╗  ██████╗ ██╗     ███████╗
// ██╔════╝ ██╔═══██╗██╔═══██╗██╔════╝ ██║     ██╔════╝
// ██║  ███╗██║   ██║██║   ██║██║  ███╗██║     █████╗
// ██║   ██║██║   ██║██║   ██║██║   ██║██║     ██╔══╝
// ╚██████╔╝╚██████╔╝╚██████╔╝╚██████╔╝███████╗███████╗
//  ╚═════╝  ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚══════╝

// const drive = google.drive({
//   version: 'v3',
//   auth: oauth2Client,
// });

router.get('/google', async (req, res) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });
  res.redirect(authUrl);
});

export type RoutePostAuthGoogleRemoveQuery = Record<PropertyKey, never>;
export type RoutePostAuthGoogleRemove = Record<PropertyKey, never>;
router.post('/google/remove', authorize, async (req, res) => {
  await T.members.update(req.tokenMember!.id, { google_tokens: null });
  return res.status(200).json({ message: 'Auth removed' });
});

router.get('/google/callback', async (req, res) => {
  const code = req.query.code as string;

  let validTokens: GoogleTokens;
  try {
    const { tokens } = await googleClient.getToken(code);
    if (!tokens.access_token) {
      return res.status(401).json({ error: `Auth failed; couldn't get access token` });
    }
    validTokens = tokens as GoogleTokens;
  } catch (e) {
    return res.status(401).json({ error: `Invalid tokens` });
  }

  const userInfo = await getUserInfo(validTokens);

  if (!userInfo || !userInfo.email) {
    return res.status(401).json({ error: `Auth failed; couldn't get user info` });
  }

  const existingMember = await T.members.where({ email: userInfo.email }).one();
  if (existingMember) {
    await T.members.update(existingMember.id, { google_tokens: validTokens });
  } else {
    await T.members.insert({
      email: userInfo.email,
      google_tokens: validTokens,
      ...(userInfo.name ? { full_name: userInfo.name } : {}),
    });
  }

  return res.redirect('/account');
});

async function getUserInfo(tokens: GoogleTokens) {
  try {
    const oauth = googleOauthForMember(tokens);
    const userInfo = await oauth.userinfo.get();
    const email = userInfo.data.email;
    const name = userInfo.data.name;
    return { name, email };
  } catch (error) {
    console.error('Error fetching user info', error);
    return null;
  }
}

export default router;
