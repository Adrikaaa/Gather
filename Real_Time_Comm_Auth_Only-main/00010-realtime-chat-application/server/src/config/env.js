import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const envFile = fileURLToPath(new URL('../../.env', import.meta.url));
dotenv.config({ path: envFile, quiet: true });

const required = [
  'MONGODB_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'CLIENT_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
];
for (const key of required) {
  if (!process.env[key]?.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

for (const key of ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET']) {
  const secret = process.env[key];
  if (secret.length < 32 || secret.startsWith('replace-with-')) {
    throw new Error(`${key} must be a random secret of at least 32 characters`);
  }

}

if (process.env.ACCESS_TOKEN_SECRET === process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('Access and refresh token secrets must be different');
}
if (!/^mongodb(\+srv)?:\/\//.test(process.env.MONGODB_URI)) {
  throw new Error('MONGODB_URI must be a MongoDB connection URI');
}
for (const key of ['CLIENT_URL', 'GOOGLE_CALLBACK_URL']) {
  if (!URL.canParse(process.env[key])) {
    throw new Error(`${key} must be a full URL, e.g. http://localhost:5173`);
  }
}
const nodeEnv = process.env.NODE_ENV ?? 'development';
const port = Number(process.env.PORT ?? 5001);

if (!['development', 'test', 'production'].includes(nodeEnv)) {
  throw new Error('Invalid NODE_ENV');
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Invalid PORT');
}

export const env = Object.freeze({
  nodeEnv,
  port,
  mongoUri: process.env.MONGODB_URI,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  clientUrl: process.env.CLIENT_URL.replace(/\/+$/, ''),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
});
