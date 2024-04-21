import { Router } from 'express';
import bodyParser from 'body-parser';
import { google } from 'googleapis';
import { Member, SanitizedMember, T } from '@db';
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

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/_api_/auth/google/callback',
);

// const drive = google.drive({
//   version: 'v3',
//   auth: oauth2Client,
// });

router.get('/google', async (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });
  res.redirect(authUrl);
});

router.post('/google/remove', authorize, async (req, res) => {
  await T.members.update(req.tokenMember!.id, { google_tokens: null });
  return res.status(200).json({ message: 'Auth removed' });
});

router.get('/google/callback', async (req, res) => {
  const code = req.query.code as string;
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token) {
    return res.status(401).json({ error: `Auth failed; couldn't get access token` });
  }

  const userInfo = await getUserInfo(tokens.access_token);

  if (!userInfo || !userInfo.email) {
    return res.status(401).json({ error: `Auth failed; couldn't get user info` });
  }

  const existingMember = await T.members.where({ email: userInfo.email }).one();
  if (existingMember) {
    await T.members.update(existingMember.id, { google_tokens: tokens });
  } else {
    await T.members.insert({
      email: userInfo.email,
      google_tokens: tokens,
      ...(userInfo.name ? { full_name: userInfo.name } : {}),
    });
  }

  return res.status(200).json({ message: 'Auth successful' });
});

async function getUserInfo(accessToken: string) {
  try {
    const oauthClient = new google.auth.OAuth2();
    oauthClient.setCredentials({ access_token: accessToken });
    const oauth = google.oauth2({ auth: oauthClient, version: 'v2' });
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
