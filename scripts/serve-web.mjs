#!/usr/bin/env node
/**
 * `expo export --platform web` çıktısını (dist/) yayınlar.
 * SPA olduğu için bilinmeyen yollar index.html'e düşer.
 * Kullanım: node scripts/serve-web.mjs [klasör] [port]
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist');
const port = Number(process.env.PORT ?? process.argv[3] ?? 8081);
const host = process.env.HOST ?? '0.0.0.0';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

if (!existsSync(join(root, 'index.html'))) {
  console.error(`index.html bulunamadı: ${root}. Önce "npm run export:web" çalıştırın.`);
  process.exit(1);
}

createServer((request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    let filePath = normalize(join(root, pathname));

    if (!filePath.startsWith(root + sep) && filePath !== root) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    if (pathname.endsWith('/')) filePath = join(filePath, 'index.html');

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      // Uzantısız yol → SPA yönlendirmesi
      if (!extname(pathname)) {
        filePath = join(root, 'index.html');
      } else {
        response.writeHead(404).end('Not found');
        return;
      }
    }

    response.writeHead(200, {
      'Content-Type': mime[extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': extname(filePath).match(/\.(js|css|png|ttf|woff2?)$/)
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500).end('Server error');
    console.error(error);
  }
}).listen(port, host, () => {
  console.log(`Rebel Cut web önizlemesi: http://${host}:${port}`);
});
