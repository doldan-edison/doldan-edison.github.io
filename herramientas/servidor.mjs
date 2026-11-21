// Vista previa en la PC. Sirve el sitio en / y cada juego en la misma ruta que tiene publicado,
// para que los enlaces funcionen igual que en internet.
// Uso:  node herramientas/servidor.mjs [puerto]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const montajes = {
  '/escuadron-antiplaga/': path.resolve(raiz, '..', 'JuegoHormigas'),
  '/escuadron-cacerola/': path.resolve(raiz, '..', 'EscuadronCacerola'),
};
const tipos = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};
const puerto = Number(process.argv[2]) || 8380;

http.createServer((req, res) => {
  let ruta;
  try { ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }

  let base = raiz, rel = ruta;
  for (const [prefijo, carpeta] of Object.entries(montajes)) {
    if (ruta + '/' === prefijo) { res.writeHead(301, { Location: prefijo }).end(); return; }
    if (ruta.startsWith(prefijo)) { base = carpeta; rel = ruta.slice(prefijo.length - 1); }
  }

  let archivo = path.join(base, rel);
  if (archivo !== base && !archivo.startsWith(base + path.sep)) { res.writeHead(403).end(); return; }
  let st = fs.existsSync(archivo) ? fs.statSync(archivo) : null;
  if (st && st.isDirectory()) {
    if (!ruta.endsWith('/')) { res.writeHead(301, { Location: ruta + '/' }).end(); return; }
    archivo = path.join(archivo, 'index.html');
    st = fs.existsSync(archivo) ? fs.statSync(archivo) : null;
  }
  if (!st || !st.isFile()) {
    const no = path.join(raiz, '404.html');
    res.writeHead(404, { 'Content-Type': tipos['.html'] });
    res.end(fs.existsSync(no) ? fs.readFileSync(no) : 'No encontrado');
    return;
  }
  res.writeHead(200, { 'Content-Type': tipos[path.extname(archivo).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(archivo).pipe(res);
}).listen(puerto, '127.0.0.1', () => console.log(`Sitio en http://127.0.0.1:${puerto}/`));
