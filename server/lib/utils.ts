import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mime from 'mime';
import { Member } from '@db';

export const colorConsole = {
  green: (text: string, ...other: any) => console.log('\x1b[32m%s\x1b[0m', text, ...other),
  greenBg: (text: string) => console.log('\x1b[42m%s\x1b[0m', text),
  red: (text: string) => console.log('\x1b[31m%s\x1b[0m', text),
};

export function removeKeys(obj: Record<string, any>, excluded: string[] = []) {
  const newObj = { ...obj };
  for (const column of excluded) {
    delete newObj[column];
  }
  return newObj;
}

export function rowsToJson(rows: Record<string, any>[], excludeColumns: string[] = []) {
  return rows.map((row) => {
    const json: Record<string, any> = { ...row };
    for (const column of excludeColumns) {
      delete json[column];
    }
    return json;
  });
}

export function getMime(ext: string) {
  switch (ext) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'application/javascript';
    case '.png':
      return 'image/png';
    case '.ico':
      return 'image/x-icon';
    case '':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

export function validateEmail(email: string) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

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

type TokenMember = {
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
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function tokenData(token: string): TokenMember & { exp: number; iat: number } {
  return JSON.parse(atob(token.split('.')[1]));
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

export function sanitizeMember(member: Member) {
  return removeKeys(member, ['passphrase']);
}

export async function tokenFromMember(member: Member) {
  return await generateToken({
    id: member.id,
    email: member.email,
    fullName: member.full_name,
  });
}

export function randomEmail() {
  return `${Math.random().toString(36).substring(2, 15)}@example.com`;
}

export function groupByKey(arr: Record<string, any>[], key: string) {
  return arr.reduce((acc, obj) => {
    const val = obj[key];
    acc[val] = (acc[val] || []).concat(obj);
    return acc;
  }, {});
}
