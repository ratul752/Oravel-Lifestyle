import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';
await build();
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.webp':'image/webp', '.png':'image/png' };
const routes = { '/':'index.html', '/admin':'admin.html', '/order-success':'order-success.html' };
http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/$/, '') || '/';
    const name = routes[pathname] || pathname.slice(1);
    if (!/^[a-zA-Z0-9_.-]+$/.test(name) || name.startsWith('.')) throw new Error('Not found');
    const data = await fs.readFile(path.join(root, name));
    res.writeHead(200, {'Content-Type':mime[path.extname(name)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(5173, () => console.log('Oravel client: http://localhost:5173'));
