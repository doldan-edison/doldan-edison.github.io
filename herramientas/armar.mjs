// Arma el sitio: toma las páginas de fuente/, las mete en fuente/plantilla.html y escribe el HTML final en la raíz.
// Uso:  node herramientas/armar.mjs
// Todo lo que cambia entre "sitio de prueba" y "sitio con dominio y anuncios" sale de config.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fuente = path.join(raiz, 'fuente');
// El Bloc de notas y PowerShell a veces guardan con una marca invisible al principio (BOM): se la quitamos.
const cfg = JSON.parse(fs.readFileSync(path.join(raiz, 'config.json'), 'utf8').replace(/^﻿/, ''));
if (/Ã.|Â./.test(cfg.nombre || '')) throw new Error('config.json: el nombre tiene las letras con acento rotas. Guardá el archivo como UTF-8.');

const url = (cfg.url || '').trim().replace(/\/+$/, '');
const adsense = (cfg.adsense || '').trim();
if (adsense && !/^ca-pub-\d{10,20}$/.test(adsense)) throw new Error('config.json: "adsense" tiene que ser como ca-pub-1234567890123456');
if (url && !/^https:\/\/[^/]+$/.test(url)) throw new Error('config.json: "url" tiene que ser como https://midominio.com (sin barra al final)');

const contacto = cfg.contacto || {};
const banderas = { adsense: !!adsense, url: !!url, correo: !!contacto.correo };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const leer = (...p) => fs.readFileSync(path.join(...p), 'utf8');

// <!--incluir:nombre-->  ->  fuente/partes/nombre.html
const incluir = html => html.replace(/<!--incluir:([\w-]+)-->/g, (_, n) => leer(fuente, 'partes', n + '.html').trim());
// <!--si:adsense--> ... <!--fin-->   y   <!--si:!adsense--> ... <!--fin-->
const condicionales = html => html.replace(/<!--si:(!?)(\w+)-->([\s\S]*?)<!--fin-->/g, (_, no, k, dentro) => {
  if (!(k in banderas)) throw new Error('Condición desconocida: ' + k);
  return banderas[k] !== !!no ? dentro : '';
});
const variables = (html, v) => html.replace(/\{\{(\w+)\}\}/g, (_, k) => {
  if (!(k in v)) throw new Error('Variable desconocida: ' + k);
  return v[k];
});

const plantilla = leer(fuente, 'plantilla.html');
const paginas = [];

for (const archivo of fs.readdirSync(fuente).filter(f => f.endsWith('.html') && f !== 'plantilla.html').sort()) {
  const crudo = leer(fuente, archivo);
  const m = crudo.match(/^<!--\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(archivo + ': falta el bloque de datos al principio');
  const meta = Object.fromEntries(m[1].split(/\r?\n/).map(l => l.match(/^\s*(\w+)\s*:\s*(.*)$/)).filter(Boolean).map(x => [x[1], x[2].trim()]));
  for (const k of ['titulo', 'descripcion', 'ruta']) if (!meta[k]) throw new Error(archivo + ': falta "' + k + '"');

  const esInicio = meta.ruta === '/';
  const conAnuncios = adsense && meta.anuncios !== 'no';
  const cabeza = [
    url && meta.indexar !== 'no' ? `<link rel="canonical" href="${url}${meta.ruta}">` : '',
    url ? `<meta property="og:url" content="${url}${meta.ruta}">` : '',
    meta.indexar === 'no' ? '<meta name="robots" content="noindex">' : '',
    adsense ? `<meta name="google-adsense-account" content="${adsense}">` : '',
    conAnuncios ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}" crossorigin="anonymous"></script>` : '',
  ].filter(Boolean).join('\n');

  const v = {
    nombre: esc(cfg.nombre),
    titulo: esc(meta.titulo),
    tituloPagina: esc(esInicio ? meta.titulo : meta.titulo + ' · ' + cfg.nombre),
    descripcion: esc(meta.descripcion),
    cabeza,
    anio: String(new Date().getFullYear()),
    contactoUrl: esc(contacto.url || ''),
    contactoTexto: esc(contacto.texto || ''),
    correo: esc(contacto.correo || ''),
  };
  const contenido = variables(condicionales(incluir(crudo.slice(m[0].length))), v);
  let html = variables(condicionales(plantilla), { ...v, contenido });
  html = html.replace(/ data-seccion="([^"]+)"/g, (_, s) => (s === meta.seccion ? ' aria-current="page"' : ''));

  const salida = meta.ruta.endsWith('/') ? path.join(raiz, meta.ruta, 'index.html') : path.join(raiz, meta.ruta);
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  fs.writeFileSync(salida, html.replace(/\n{3,}/g, '\n\n'));
  paginas.push(meta);
  console.log('  ' + path.relative(raiz, salida));
}

// Archivos que dependen de la configuración
const poner = (nombre, texto) => {
  const f = path.join(raiz, nombre);
  if (texto) { fs.writeFileSync(f, texto); console.log('  ' + nombre); }
  else if (fs.existsSync(f)) { fs.rmSync(f); console.log('  (quitado) ' + nombre); }
};
fs.writeFileSync(path.join(raiz, '.nojekyll'), '');
poner('ads.txt', adsense ? `google.com, ${adsense.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n` : '');
const indexables = paginas.filter(p => p.indexar !== 'no');
poner('sitemap.xml', url ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexables.map(p => `  <url><loc>${url}${p.ruta}</loc></url>`).join('\n')}\n</urlset>\n` : '');
poner('robots.txt', `User-agent: *\nAllow: /\n${url ? `Sitemap: ${url}/sitemap.xml\n` : ''}`);
const host = url ? new URL(url).host : '';
poner('CNAME', host && !host.endsWith('.github.io') ? host + '\n' : '');

console.log(`Listo: ${paginas.length} páginas. Anuncios: ${adsense || 'sin configurar'}. Dirección: ${url || 'sin configurar'}.`);
