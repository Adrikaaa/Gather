import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const path = new URL('../.env', import.meta.url);
const content = [
  'NODE_ENV=development',
  'PORT=5001',
  'MONGODB_URI=mongodb://127.0.0.1:27017/realtime-chat',
  `ACCESS_TOKEN_SECRET=${randomBytes(48).toString('hex')}`,
  `REFRESH_TOKEN_SECRET=${randomBytes(48).toString('hex')}`,
  'CLIENT_URL=http://localhost:5173',
  'GOOGLE_CLIENT_ID=',
  'GOOGLE_CLIENT_SECRET=',
  'GOOGLE_CALLBACK_URL=http://localhost:5173/api/v1/auth/google/callback',
  '',
].join('\n');

try {
  await writeFile(path, content, { flag: 'wx', mode: 0o600 });
  console.log('Created server/.env with random JWT secrets. Configure MONGODB_URI and the Google OAuth keys before starting.');
} catch (error) {
  if (error.code === 'EEXIST') {
    console.error('server/.env already exists. It was not overwritten.');
  } else {
    console.error('Could not create server/.env:', error.message);
  }
  process.exitCode = 1;
}
