import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import storefront from './src/pages/storefront.mjs';
import admin from './src/pages/admin.mjs';
import success from './src/pages/order-success.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
export async function build() {
  try { process.loadEnvFile(path.join(root, '.env')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const configured = process.env.PUBLIC_API_BASE_URL || (process.env.VERCEL ? '' : 'http://localhost:5000');
  if (!configured) throw new Error('Set PUBLIC_API_BASE_URL in the client Vercel environment');
  const url = new URL(configured);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('PUBLIC_API_BASE_URL must be a server origin without a path');
  if (process.env.VERCEL && (url.protocol !== 'https:' || ['localhost','127.0.0.1','[::1]'].includes(url.hostname))) throw new Error('Use the deployed HTTPS backend URL');
  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(dist, { recursive: true });
  for (const [name, html] of [['index', storefront], ['admin', admin], ['order-success', success]]) await fs.writeFile(path.join(dist, name + '.html'), html);
  for (const dir of ['assets','src/scripts','src/styles']) {
    for (const file of await fs.readdir(path.join(root, dir))) await fs.copyFile(path.join(root, dir, file), path.join(dist, file));
  }
  await fs.writeFile(path.join(dist, 'api-config.js'), `window.ORAVEL_API_BASE = ${JSON.stringify(url.origin)};\n`);
  console.log('Client built to dist/; API: ' + url.origin);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
