import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mime from 'mime';
import { Member } from '@db';
import { IncomingHttpHeaders } from 'http';

export const colorConsole = {
  green: (text: string, ...other: any) => console.log('\x1b[32m%s\x1b[0m', text, ...other),
  greenBg: (text: string) => console.log('\x1b[42m%s\x1b[0m', text),
  red: (text: string) => console.log('\x1b[31m%s\x1b[0m', text),
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
  const mimeType = mime.getType(fileName);
  return { fileName, mimeType };
}

export function getSubdomain(url: URL) {
  if (!process.env.BASE_HOSTNAME) throw 'BASE_HOSTNAME environment variable not set';
  const subdomain = url.hostname.replace(new RegExp(`\\.${process.env.BASE_HOSTNAME}$`), '');
  if (subdomain === url.hostname) return null;
  return subdomain;
}

export function removeKeys(obj: Record<string, any>, excluded: string[] = []) {
  const newObj = { ...obj };
  for (const column of excluded) {
    delete newObj[column];
  }
  return newObj;
}

export function sanitizeMember(member: Member) {
  return removeKeys(member, ['passphrase']);
}

export function randomEmail() {
  return `${Math.random().toString(36).substring(2, 15)}@example.com`;
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
  fullName: string;
};

export async function generateToken(member: TokenMember, expIn = 60 * 60 * 24 * 30) {
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

export async function tokenFromMember(member: Member) {
  return await generateToken({
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
