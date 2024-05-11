import 'dotenv/config';

export const API_PATH = '_api_';
export const APP_STATIC_PATH = 'dist/';
export const appEnv =
  process.env.NODE_ENV === 'production' ? 'prod' : process.env.NODE_ENV === 'test' ? 'test' : 'dev';
export const isDev = appEnv === 'dev';
export const isProd = appEnv === 'prod';
export const isTest = appEnv === 'test';
export const vercelMiddlewareMemberSite = '/_member_site_/';

export const PORT = isTest ? 3123 : process.env.PORT ? parseInt(process.env.PORT) : 3000;
export const SILENCE_SQL_LOGS = process.env.SILENCE_SQL_LOGS === 'true';
export const publicDomains = isProd
  ? ['.hoja.ar', '.hojaweb.xyz']
  : ['.hoja.localhost', '.hojaweb.localhost'];
export const adminDomains = isProd
  ? ['hoja.ar', 'hojaweb.xyz']
  : ['hoja.localhost', 'hojaweb.localhost'];
