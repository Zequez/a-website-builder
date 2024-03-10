import 'dotenv/config';

export const API_PATH = '_api_';
export const APP_STATIC_PATH = 'app_dist';
export const env = process.env;
export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';
export const PORT = isTest ? 3123 : process.env.PORT ? parseInt(process.env.PORT) : 3000;
export const SILENCE_SQL_LOGS = env.SILENCE_SQL_LOGS === 'true';
