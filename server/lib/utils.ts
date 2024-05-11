import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IncomingHttpHeaders } from 'http';
import { stringify } from 'querystring';
import { File_, Member, SanitizedMember } from '@db';
import { FileB64 } from '@server/db/driver';

export const QS = stringify;

export const colorConsole = {
  green: (text: string, ...other: any) => console.log('\x1b[32m%s\x1b[0m', text, ...other),
  greenBg: (text: string) => console.log('\x1b[42m%s\x1b[0m', text),
  red: (text: any) => console.log('\x1b[31m%s\x1b[0m', text.toString()),
};

export async function hashPass(passphrase: string): Promise<string> {
  const saltRounds = 10;
  return new Promise((resolve) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      // Hash the password using the generated salt
      bcrypt.hash(passphrase, salt, function (err, hash) {
        // Store hash in your password database
        resolve(hash);
      });
    });
  });
}

export async function hashCompare(plainPass: string, hashedPass: string) {
  return bcrypt.compare(plainPass, hashedPass);
}

export function parseUrlFile(url: URL) {
  let fileName = url.pathname.slice(1);
  if (!fileName) fileName = 'index.html';
  if (fileName.endsWith('/')) fileName += 'index.html';
  if (!fileName.match(/\./)) fileName += '.html';
  return { fileName };
}

export function removeKeys(obj: Record<string, any>, excluded: string[] = []) {
  const newObj = { ...obj };
  for (const column of excluded) {
    delete newObj[column];
  }
  return newObj;
}

export function sanitizeMember(member: Member): SanitizedMember {
  const sanitized = removeKeys(member, ['passphrase', 'google_tokens']) as SanitizedMember;
  console.log(member);
  sanitized.google = !!member.google_tokens;
  return sanitized;
}

export function randomEmail() {
  return `${Math.random().toString(36).substring(2, 15)}@example.com`;
}

export function updateFileToB64(file: File_): FileB64 {
  let editedFile = file as unknown as FileB64;
  editedFile.data = Buffer.from(file.data).toString('base64') as any;
  editedFile.data_size = parseInt(file.data_size);
  return editedFile;
}

// ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗    ███████╗████████╗██╗   ██╗███████╗███████╗
// ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║    ██╔════╝╚══██╔══╝██║   ██║██╔════╝██╔════╝
//    ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║    ███████╗   ██║   ██║   ██║█████╗  █████╗
//    ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║    ╚════██║   ██║   ██║   ██║██╔══╝  ██╔══╝
//    ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║    ███████║   ██║   ╚██████╔╝██║     ██║
//    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝    ╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝

export type TokenMember = {
  id: number;
  email: string;
  fullName: string | null;
  exp: number;
};

export function generateToken(member: Omit<TokenMember, 'exp'>, expIn = 60 * 60 * 24 * 30) {
  if (!process.env.JWT_SECRET) throw 'JWT_SECRET environment variable not set';
  const exp = Math.round(new Date().getTime() / 1000) + expIn;
  const token = jwt.sign({ ...member, exp }, process.env.JWT_SECRET);
  return token;
}

export function verifyToken(token: string) {
  if (!process.env.JWT_SECRET) throw 'JWT_SECRET environment variable not set';
  try {
    const maybePayload = jwt.verify(token, process.env.JWT_SECRET);
    return maybePayload ? (maybePayload as TokenMember) : null;
  } catch (err) {
    return null;
  }
}

export function tokenData(token: string): TokenMember & { exp: number; iat: number } {
  return JSON.parse(atob(token.split('.')[1]));
}

export function tokenFromMember(member: Member) {
  return generateToken({
    id: member.id,
    email: member.email,
    fullName: member.full_name,
  });
}

export function tokenFromHeader(reqHeaders: IncomingHttpHeaders) {
  const authorizationString = reqHeaders.authorization;
  if (authorizationString) {
    return authorizationString.replace('Bearer ', '');
  } else {
    return null;
  }
}

export function verifiedTokenFromHeader(reqHeader: IncomingHttpHeaders) {
  const token = tokenFromHeader(reqHeader);
  if (token) {
    return verifyToken(token);
  } else {
    return null;
  }
}

export function validateTokenExpiry(tokenData: { exp: number }) {
  return new Date(tokenData.exp * 1000).getTime() > new Date().getTime();
}
